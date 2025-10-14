"""
Tenant Isolation Middleware - Extract restaurant_id from subdomain/header
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
import re

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip tenant check for health checks and public endpoints
        if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Skip tenant check for auth endpoints (register, login)
        if request.url.path.startswith("/api/v1/auth"):
            return await call_next(request)
        
        restaurant_id = None
        
        # Method 1: Extract from subdomain (e.g., restaurant1.yourdomain.com)
        host = request.headers.get("host", "")
        subdomain_match = re.match(r"^([a-z0-9-]+)\.", host)
        
        if subdomain_match:
            subdomain = subdomain_match.group(1)
            # Query database to get restaurant_id from subdomain
            # For now, we'll use a simple approach
            request.state.restaurant_slug = subdomain
        
        # Method 2: Extract from custom header
        restaurant_header = request.headers.get("X-Restaurant-ID")
        if restaurant_header:
            try:
                restaurant_id = int(restaurant_header)
                request.state.restaurant_id = restaurant_id
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid restaurant ID in header"
                )
        
        # Method 3: Extract from JWT token (handled in auth dependency)
        # This will be set by the get_current_user dependency
        
        response = await call_next(request)
        return response
