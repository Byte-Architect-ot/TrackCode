# Docker Setup Guide

This guide explains how to run the TrackCode platform using Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd TrackCode
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.docker.example .env
   # Edit .env and set your JWT_SECRET and ADMIN_SECRET_KEY
   ```

3. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

4. **Seed the database** (optional, creates dummy educator and contest):
   ```bash
   docker-compose exec backend npm run seed
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017

## Services

### MongoDB (`mongodb`)
- **Image**: `mongo:6`
- **Port**: `27017`
- **Volume**: `mongodb_data` (persistent storage)
- **Health Check**: Enabled (waits for MongoDB to be ready)

### Backend (`backend`)
- **Port**: `5001`
- **Environment Variables**:
  - `MONGODB_URI`: Automatically set to `mongodb://mongodb:27017/contest_platform`
  - `JWT_SECRET`: From `.env` file
  - `ADMIN_SECRET_KEY`: From `.env` file
- **Health Check**: Checks `/health` endpoint
- **Dependencies**: Waits for MongoDB to be healthy before starting

### Frontend (`frontend`)
- **Port**: `3000`
- **Build**: Multi-stage build (Node.js → Nginx)
- **Proxy**: `/api` requests are proxied to backend
- **Health Check**: Checks if nginx is serving content
- **Dependencies**: Waits for backend to be healthy before starting

### Judge (`judge`)
- **Purpose**: Build-only service for code execution environment
- **Profile**: `build-only` (not started by default)
- **Usage**: Built when needed for code compilation/running

## Common Commands

### Start services
```bash
docker-compose up
```

### Start in background (detached)
```bash
docker-compose up -d
```

### Rebuild and start
```bash
docker-compose up --build
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Execute commands in containers
```bash
# Run seed script
docker-compose exec backend npm run seed

# Access MongoDB shell
docker-compose exec mongodb mongosh contest_platform

# Access backend shell
docker-compose exec backend sh

# Access frontend shell
docker-compose exec frontend sh
```

### Restart a specific service
```bash
docker-compose restart backend
```

## Troubleshooting

### MongoDB connection issues
- Ensure MongoDB container is healthy: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Backend will retry connection up to 10 times with 3-second delays

### Backend not starting
- Check if MongoDB is ready: `docker-compose ps mongodb`
- View backend logs: `docker-compose logs backend`
- Ensure environment variables are set in `.env`

### Frontend not loading
- Check if backend is healthy: `docker-compose ps backend`
- View frontend logs: `docker-compose logs frontend`
- Check nginx config: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf`

### Port already in use
- Change ports in `docker-compose.yml`:
  - Frontend: `"3000:3000"` → `"3001:3000"`
  - Backend: `"5001:5001"` → `"5002:5001"`
  - MongoDB: `"27017:27017"` → `"27018:27017"`

### Rebuild after code changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Or rebuild all
docker-compose up --build
```

## Development vs Production

### Development
- Set `NODE_ENV=development` in `docker-compose.yml` (backend service)
- Mount volumes for live code reloading (if using nodemon)
- Enable verbose logging

### Production
- Set `NODE_ENV=production` (already set)
- Use proper secrets management (not `.env` files)
- Enable HTTPS/TLS
- Use reverse proxy (Traefik, Nginx) for SSL termination
- Set up proper backup strategy for MongoDB

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production
ADMIN_SECRET_KEY=admin_secret_key
```

**⚠️ Important**: Change these values in production!

## Health Checks

All services have health checks configured:
- **MongoDB**: Checks if database is responding
- **Backend**: Checks `/health` endpoint
- **Frontend**: Checks if nginx is serving content

Services wait for dependencies to be healthy before starting.

## Volumes

- `mongodb_data`: Persistent MongoDB data storage
- `./backend/problems`: Mounted for file storage (if needed)
- `/var/run/docker.sock`: Mounted for Docker-in-Docker (code execution)

## Network

All services are on the same Docker network and can communicate using service names:
- `mongodb` → MongoDB service
- `backend` → Backend API service
- `frontend` → Frontend service
