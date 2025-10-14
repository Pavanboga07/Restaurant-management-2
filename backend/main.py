"""
FastAPI Main Application - Multi-Tenant Restaurant Management System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import socketio

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, restaurants, menu, tables, orders, inventory, staff, payments, ai, global_dishes, add_from_global
from app.sockets.events import sio
from app.middleware.tenant import TenantMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

# Create database tables
Base.metadata.create_all(bind=engine)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Multi-Tenant Restaurant Management System...")
    print(f"📊 Database: {settings.DATABASE_URL}")
    print(f"🔒 Environment: {settings.ENVIRONMENT}")
    yield
    # Shutdown
    print("👋 Shutting down...")

# Initialize FastAPI
app = FastAPI(
    title="Restaurant Management System API",
    description="Multi-tenant, AI-powered restaurant management platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Socket.IO App
socket_app = socketio.ASGIApp(
    sio,
    other_asgi_app=app,
    socketio_path="/socket.io"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Performance Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses > 1KB

# Custom Middleware
app.add_middleware(TenantMiddleware)
app.add_middleware(RateLimitMiddleware)

# API Routes (with /v1 versioning)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(restaurants.router, prefix="/api/v1/restaurants", tags=["Restaurants"])
app.include_router(menu.router, prefix="/api/v1/menu", tags=["Menu"])
app.include_router(tables.router, prefix="/api/v1/tables", tags=["Tables"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI Services"])
app.include_router(global_dishes.router, prefix="/api/v1", tags=["Global Dish Library"])
app.include_router(add_from_global.router, prefix="/api/v1", tags=["Add Dish from Global"])

# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {
        "message": "🍽️ Restaurant Management System API",
        "docs": "/docs",
        "health": "/health",
        "api_version": "v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:socket_app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
