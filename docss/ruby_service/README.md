# AtonixCorp Ruby Service

A Ruby-based microservice for editorial content management and CI/CD job orchestration, built with Sinatra, Puma, and Sidekiq.

## Features

### Editorial Management
- **Article Processing**: Background indexing, SEO optimization, and content management
- **Feed Management**: RSS/Atom feed aggregation and processing
- **Content Cleanup**: Automated cleanup of drafts and temporary content
- **SEO Tools**: Sitemap generation and search engine optimization

### CI/CD Orchestration
- **Build Management**: Queue and execute CI builds
- **Deployment Orchestration**: Manage deployments across environments
- **Test Aggregation**: Collect and report test results
- **Infrastructure Monitoring**: Health checks and resource monitoring
- **Security Scanning**: Automated security vulnerability scanning
- **Backup Verification**: Ensure backup integrity and test restoration

### Background Processing
- **Sidekiq Workers**: Asynchronous job processing with Redis
- **Scheduled Tasks**: Cron-like job scheduling
- **Queue Management**: Priority-based job queues
- **Retry Logic**: Automatic retry with exponential backoff
- **Monitoring**: Job success/failure tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sinatra API   │    │   Sidekiq Web   │    │   Prometheus    │
│     (Puma)      │    │      UI         │    │   Metrics       │
│                 │    │                 │    │                 │
│ • Editorial API │    │ • Job Monitoring│    │ • Health Checks │
│ • CI/CD API     │    │ • Queue Status  │    │ • Performance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │                 │
                    │ • Job Queues    │
                    │ • Cache         │
                    │ • Pub/Sub       │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │                 │
                    │ • Articles      │
                    │ • Builds        │
                    │ • Deployments   │
                    │ • Test Results  │
                    └─────────────────┘
```

## Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   bundle install
   ```

2. **Setup Database**
   ```bash
   createdb atonixcorp_ruby_dev
   bundle exec rake db:migrate
   ```

3. **Start Redis**
   ```bash
   redis-server
   ```

4. **Start the Application**
   ```bash
   # Start web server
   bundle exec puma -C config/puma.rb

   # Start Sidekiq workers (in another terminal)
   bundle exec sidekiq

   # Start Sidekiq scheduler (in another terminal)
   bundle exec sidekiq -r ./config/sidekiq.rb
   ```

5. **Access the Application**
   - Web API: http://localhost:3000
   - Sidekiq Web UI: http://localhost:3000/sidekiq (if enabled)
   - Health Check: http://localhost:3000/health

### Docker Development

```bash
# Build the image
docker build -t atonixcorp/ruby-service .

# Run with Docker Compose
docker-compose up -d
```

### Production Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -n atonixcorp
kubectl get services -n atonixcorp
```

## API Documentation

### Editorial API

#### Articles
```bash
# Get all articles
GET /api/v1/editorial/articles

# Get article by ID
GET /api/v1/editorial/articles/:id

# Create article
POST /api/v1/editorial/articles

# Update article
PUT /api/v1/editorial/articles/:id

# Delete article
DELETE /api/v1/editorial/articles/:id

# Trigger indexing
POST /api/v1/editorial/articles/index
```

#### Feeds
```bash
# Get all feeds
GET /api/v1/editorial/feeds

# Create feed
POST /api/v1/editorial/feeds

# Update feed
PUT /api/v1/editorial/feeds/:id

# Trigger updates
POST /api/v1/editorial/feeds/update
```

#### SEO
```bash
# Generate sitemap
POST /api/v1/editorial/seo/sitemap

# Optimize SEO
POST /api/v1/editorial/seo/optimize

# Get SEO stats
GET /api/v1/editorial/seo/stats
```

### CI/CD API

#### Builds
```bash
# Get all builds
GET /api/v1/ci/builds

# Trigger build
POST /api/v1/ci/builds

# Get build logs
GET /api/v1/ci/builds/:id/logs

# Cancel build
POST /api/v1/ci/builds/:id/cancel
```

#### Deployments
```bash
# Get all deployments
GET /api/v1/ci/deployments

# Trigger deployment
POST /api/v1/ci/deployments

# Rollback deployment
POST /api/v1/ci/deployments/:id/rollback
```

#### Tests
```bash
# Get test results
GET /api/v1/ci/tests

# Trigger test run
POST /api/v1/ci/tests
```

#### Infrastructure
```bash
# Get infrastructure status
GET /api/v1/ci/infrastructure/status

# Trigger health check
POST /api/v1/ci/infrastructure/health-check
```

#### Security
```bash
# Trigger security scan
POST /api/v1/ci/security/scan

# Get security results
GET /api/v1/ci/security/results
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RACK_ENV` | `development` | Application environment |
| `PORT` | `3000` | Server port |
| `DATABASE_URL` | `postgres://localhost/atonixcorp_ruby` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection string |
| `LOG_LEVEL` | `info` | Logging level |
| `SIDEKIQ_CONCURRENCY` | `25` | Sidekiq worker concurrency |
| `ENABLE_SIDEKIQ_SCHEDULER` | `true` | Enable scheduled jobs |

### Puma Configuration

The application uses Puma as the web server with the following default settings:
- **Workers**: 2 (production)
- **Threads**: 1-16 per worker
- **Timeout**: 3600 seconds
- **Preloading**: Enabled for performance

### Sidekiq Configuration

Background job processing with:
- **Queues**: critical, editorial, ci, default
- **Retry**: 3 attempts with exponential backoff
- **Scheduler**: Cron-like job scheduling
- **Monitoring**: Built-in metrics and health checks

## Background Jobs

### Editorial Jobs
- **Article Indexing**: Search engine indexing every 5 minutes
- **Feed Updates**: RSS/Atom feed processing every 15 minutes
- **Content Cleanup**: Remove old drafts daily at 2 AM
- **SEO Optimization**: Update metadata hourly
- **Sitemap Generation**: Refresh sitemaps on demand

### CI/CD Jobs
- **Build Processing**: Handle build queue every minute
- **Deployment Checks**: Monitor deployments every 2 minutes
- **Test Aggregation**: Collect results every 5 minutes
- **Infrastructure Health**: System checks every 10 minutes
- **Security Scans**: Vulnerability scans daily at 3 AM
- **Backup Verification**: Integrity checks daily at 4 AM

## Monitoring

### Health Checks
- **Application Health**: `/health` endpoint
- **Database Connectivity**: Automatic connection validation
- **Redis Connectivity**: Connection pool monitoring
- **Worker Status**: Sidekiq process monitoring

### Metrics
- **Prometheus Integration**: `/metrics` endpoint
- **Request Metrics**: Response times and error rates
- **Queue Metrics**: Job queue sizes and processing rates
- **System Metrics**: CPU, memory, and disk usage

### Logging
- **Structured Logging**: JSON format for all logs
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Log Rotation**: Automatic log rotation and archiving
- **External Integration**: Loki-compatible log format

## Security

### Authentication
- **API Keys**: Token-based authentication for API access
- **Basic Auth**: Protected Sidekiq Web UI
- **Rate Limiting**: Request rate limiting via nginx

### Authorization
- **Role-Based Access**: Different permission levels
- **Resource Scoping**: Namespace-based access control
- **Audit Logging**: All operations are logged

### Data Protection
- **Encryption**: TLS for all external communications
- **Secret Management**: Secure storage of sensitive data
- **Input Validation**: Comprehensive input sanitization

## Development

### Testing
```bash
# Run all tests
bundle exec rspec

# Run with coverage
bundle exec rspec --coverage

# Run specific test
bundle exec rspec spec/workers/editorial_worker_spec.rb
```

### Code Quality
```bash
# Lint Ruby code
bundle exec rubocop

# Auto-fix issues
bundle exec rubocop -a

# Check for security issues
bundle exec brakeman
```

### Database Tasks
```bash
# Create migration
bundle exec rake db:create_migration NAME=create_articles

# Run migrations
bundle exec rake db:migrate

# Rollback migration
bundle exec rake db:rollback

# Seed database
bundle exec rake db:seed
```

## Deployment

### Docker
```dockerfile
FROM ruby:3.2-slim
WORKDIR /app
COPY Gemfile* ./
RUN bundle install
COPY . .
EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

### Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -n atonixcorp
kubectl logs -f deployment/ruby-service -n atonixcorp
```

### Helm Chart
```bash
# Install via Helm
helm install ruby-service ./helm/ruby-service

# Upgrade
helm upgrade ruby-service ./helm/ruby-service
```

## Troubleshooting

### Common Issues

1. **Sidekiq Not Processing Jobs**
   ```bash
   # Check Sidekiq status
   bundle exec sidekiq -d

   # Check Redis connection
   redis-cli ping
   ```

2. **Database Connection Issues**
   ```bash
   # Test database connection
   bundle exec rake db:test_connection
   ```

3. **Memory Issues**
   ```bash
   # Check Puma worker status
   bundle exec pumactl stats

   # Restart workers
   bundle exec pumactl restart
   ```

4. **High CPU Usage**
   ```bash
   # Check Sidekiq queues
   bundle exec sidekiqmon

   # Monitor job performance
   bundle exec sidekiq -q critical,editorial,ci
   ```

### Logs
```bash
# Application logs
tail -f log/app.log

# Puma logs
tail -f log/puma.stdout.log

# Sidekiq logs
tail -f log/sidekiq.log

# Database logs
tail -f log/database.log
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

Copyright © 2024 AtonixCorp. All rights reserved.