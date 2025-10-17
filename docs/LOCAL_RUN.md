# Local Development: Build, Run, and RabbitMQ Integration

## 1. Build Images

Build backend and frontend images locally (from project root):

```
# Backend
nerdctl build -t atonixcorp-backend:1.0.0 -f backend/Dockerfile backend

# Frontend
nerdctl build -t atonixcorp-frontend:1.0.0 -f frontend/Dockerfile frontend
```

## 2. Start All Services (including RabbitMQ)

```
nerdctl compose -f docker-compose.local.yml up -d
```

- This will start: postgres, redis, ruby_service, backend, frontend, nginx, and rabbitmq.
- RabbitMQ management UI: http://localhost:15672 (user: `user`, password: `password`)

## 3. RabbitMQ Integration

### Backend
- The backend is configured to use RabbitMQ via the `RABBITMQ_URL` environment variable.
- Default: `amqp://user:password@rabbitmq:5672/`
- Access this in Django via `from django.conf import settings; settings.RABBITMQ_URL`
- Use a library like `pika` or `kombu` in your Django code to connect and publish/consume messages.

### Frontend
- Most web frontends do not connect directly to RabbitMQ. If you need real-time updates, use WebSockets or have the backend act as a bridge.
- If you want to test, you can use a REST endpoint in the backend that triggers a RabbitMQ message, or add a simple test page that calls the backend.

## 4. Stopping Services

```
nerdctl compose -f docker-compose.local.yml down
```

## 5. Troubleshooting
- Check RabbitMQ logs: `nerdctl logs <rabbitmq-container-id>`
- Check backend logs: `nerdctl logs <backend-container-id>`
- RabbitMQ UI: http://localhost:15672

---

For more advanced usage, see the official [RabbitMQ Python docs](https://pika.readthedocs.io/en/stable/) or [Celery with Django](https://docs.celeryq.dev/en/stable/django/first-steps-with-django.html) if you want distributed task queues.
