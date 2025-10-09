# Backend Setup Guide

## 1. Environment Variables
Set these in your shell or .env file:
- DJANGO_SETTINGS_MODULE=backend.settings
- DATABASE_URL=postgres://postgres:postgres@localhost:5432/atonixcorp_db
- REDIS_URL=redis://localhost:6379/0
- SECRET_KEY=your-secret-key

## 2. Install Dependencies
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Migrate Database
```bash
python manage.py makemigrations
python manage.py migrate
```

## 4. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

## 5. Create Admin User
```bash
python manage.py createsuperuser
```

## 6. Start Redis and Postgres
- Use docker-compose.dev.yml or run manually:
```bash
docker run -d --name redis -p 6379:6379 redis:6
docker run -d --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=atonixcorp_db -p 5432:5432 postgres:13
```

## 7. Run ASGI Server (Daphne)
```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```
Or for quick test:
```bash
python manage.py runserver 0.0.0.0:8000
```

## 8. Test Endpoints
- Open http://localhost:8000/api/
- Login to Django admin at http://localhost:8000/admin/
- Test websocket: wscat -c ws://localhost:8000/ws/chat/1/?token=YOURTOKEN

## 9. Debugging
- python manage.py check
- python manage.py showmigrations
- tail -f logs/

## 10. Useful Docker Compose
```bash
docker-compose -f docker-compose.dev.yml up --build -d
```

## 11. Next Steps
- Add frontend (see frontend/README.md)
- Apply k8s manifests for production
- Configure secrets and environment for production
