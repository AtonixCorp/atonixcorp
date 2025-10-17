# Redis Configuration
# frozen_string_literal: true

require 'redis'
require 'connection_pool'

# Redis connection configuration
redis_url = ENV.fetch('REDIS_URL', 'redis://localhost:6379/0')
redis_config = {
  url: redis_url,
  timeout: ENV.fetch('REDIS_TIMEOUT', 5).to_f
}

# NOTE: older/newer redis-client gems may not accept reconnect_* kwargs. If you need
# advanced reconnect behavior, configure a wrapper or upgrade the redis client and
# then add those options conditionally.

# SSL configuration for Redis
if redis_url.start_with?('rediss://')
  redis_config[:ssl] = true
  redis_config[:ssl_params] = {
    verify_mode: OpenSSL::SSL::VERIFY_NONE
  }
end

# Connection pool for Redis
REDIS_POOL = ConnectionPool.new(size: ENV.fetch('REDIS_POOL_SIZE', 10).to_i, timeout: 5) do
  Redis.new(redis_config)
end

# Global Redis instance for Sidekiq and other uses
redis_instance = Redis.new(redis_config)

if Redis.respond_to?(:current=)
  # Newer redis client versions provide Redis.current=
  Redis.current = redis_instance
else
  # Fallback for clients that don't provide Redis.current accessor.
  # Expose a GLOBAL_REDIS constant and define Redis.current to return it.
  GLOBAL_REDIS = redis_instance unless defined?(GLOBAL_REDIS)

  class << Redis
    def current
      defined?(GLOBAL_REDIS) ? GLOBAL_REDIS : nil
    end
  end
end

# Redis health check
def redis_connected?
  REDIS_POOL.with do |redis|
    redis.ping == 'PONG'
  end
rescue StandardError
  false
end

# Cache helper methods
def cache_get(key)
  REDIS_POOL.with do |redis|
    redis.get(key)
  end
end

def cache_set(key, value, ttl = nil)
  REDIS_POOL.with do |redis|
    if ttl
      redis.setex(key, ttl, value)
    else
      redis.set(key, value)
    end
  end
end

def cache_delete(key)
  REDIS_POOL.with do |redis|
    redis.del(key)
  end
end

# Pub/Sub helper methods
def publish(channel, message)
  REDIS_POOL.with do |redis|
    redis.publish(channel, message)
  end
end

def subscribe(channel, &block)
  REDIS_POOL.with do |redis|
    redis.subscribe(channel, &block)
  end
end

# Graceful shutdown
at_exit do
  REDIS_POOL.shutdown(&:disconnect)
end