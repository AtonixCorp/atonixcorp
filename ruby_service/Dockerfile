# Use Ruby 3.2 slim image
FROM ruby:3.2.0-slim

# Set environment variables
ENV RACK_ENV=production
ENV BUNDLE_WITHOUT=development:test
ENV BUNDLE_PATH=/usr/local/bundle
ENV GEM_HOME=/usr/local/bundle

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libssl-dev \
    libreadline-dev \
    zlib1g-dev \
    curl \
    git \
    logrotate \
    cron \
    libzookeeper-mt-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy Gemfile and install dependencies
COPY Gemfile ./
RUN bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Copy logrotate configuration
COPY logrotate.conf /etc/logrotate.d/ruby-service

# Make startup scripts executable
RUN chmod +x start.sh start-sidekiq.sh

# Create necessary directories
RUN mkdir -p log tmp/pids tmp/sockets

# Precompile assets and prepare application
RUN bundle exec rake assets:precompile 2>/dev/null || true

# Create non-root user
RUN useradd --create-home --shell /bin/bash rubyuser && \
  chown -R rubyuser:rubyuser /app

# Ensure runtime directories are writable by the app user (cron needs /var/run)
RUN mkdir -p /var/run && chown -R rubyuser:rubyuser /var/run

USER rubyuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["./start.sh"]
