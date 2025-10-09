# Sidekiq Configuration
# frozen_string_literal: true

require 'sidekiq'
require 'sidekiq-scheduler'
# Require client middleware logging explicitly for some Sidekiq versions
begin
  require 'sidekiq/client_middleware/logging'
rescue LoadError
  # ignore if not present; we'll check constants below
end

# Configure Redis connection
redis_url = ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')
redis_config = {
  url: redis_url,
  ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
}

# Enable SSL if Redis URL uses rediss://
redis_config[:ssl] = true if redis_url.start_with?('rediss://')

Sidekiq.configure_server do |config|
  # Redis connection
  config.redis = redis_config

  # Concurrency settings
  if config.respond_to?(:concurrency=)
    config.concurrency = ENV.fetch('SIDEKIQ_CONCURRENCY', 25).to_i
  end

  # Timeout settings: older/newer Sidekiq versions may not expose a `timeout=` setter on config
  if config.respond_to?(:timeout=)
    config.timeout = ENV.fetch('SIDEKIQ_TIMEOUT', 25).to_i
  end
  # If setter not available (older/newer Sidekiq), set option directly
  unless config.respond_to?(:timeout=)
    if config.respond_to?(:options) && config.options.is_a?(Hash)
      config.options[:timeout] = ENV.fetch('SIDEKIQ_TIMEOUT', 25).to_i
    end
  end

  # Queue settings
  config.queues = %w[critical editorial ci default]

  # Dead job handling
  config.death_handlers << lambda do |job, ex|
    SemanticLogger['sidekiq'].error(
      'Job died',
      job: job,
      error: ex.message,
      backtrace: ex.backtrace&.first(10)
    )
  end

  # Error handling
  config.error_handlers << lambda do |ex, ctx|
    SemanticLogger['sidekiq'].error(
      'Sidekiq error',
      error: ex.message,
      context: ctx,
      backtrace: ex.backtrace&.first(10)
    )
  end

  # Middleware
  config.server_middleware do |chain|
    if defined?(Sidekiq::Middleware::Server::RetryJobs)
      chain.add Sidekiq::Middleware::Server::RetryJobs,
                max_retries: ENV.fetch('SIDEKIQ_MAX_RETRIES', 3).to_i
    end

    if defined?(Sidekiq::Middleware::Server::Logging)
      chain.add Sidekiq::Middleware::Server::Logging
    end
  end

  # Scheduler configuration
  if ENV.fetch('ENABLE_SIDEKIQ_SCHEDULER', 'true') == 'true'
    config.on(:startup) do
      Sidekiq::Scheduler.enabled = true
      Sidekiq::Scheduler.load_schedule!(
        File.expand_path('../sidekiq_scheduler.yml', __dir__)
      )
    end
  end
end

Sidekiq.configure_client do |config|
  config.redis = redis_config

  # Client middleware
  config.client_middleware do |chain|
    # Some Sidekiq versions expose the client logging middleware under
    # Sidekiq::ClientMiddleware::Logging, others under Sidekiq::Middleware::Client::Logging.
    if defined?(Sidekiq::ClientMiddleware::Logging)
      chain.add Sidekiq::ClientMiddleware::Logging
    elsif defined?(Sidekiq::Middleware::Client::Logging)
      chain.add Sidekiq::Middleware::Client::Logging
    end
  end
end

# Web UI configuration (only in development)
if ENV.fetch('RACK_ENV', 'development') == 'development'
  require 'sidekiq/web'
  Sidekiq::Web.app_url = '/'

  # Basic auth for Sidekiq Web UI
  Sidekiq::Web.use Rack::Auth::Basic do |username, password|
    username == ENV.fetch('SIDEKIQ_USERNAME', 'admin') &&
    password == ENV.fetch('SIDEKIQ_PASSWORD', 'password')
  end
end