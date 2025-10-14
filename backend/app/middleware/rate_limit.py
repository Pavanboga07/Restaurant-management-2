"""
Rate Limiting Middleware
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        self.cleanup_task = None
    
    async def dispatch(self, request: Request, call_next):
        # Get client identifier (IP or user_id)
        client_id = request.client.host if request.client else "unknown"
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/"]:
            return await call_next(request)
        
        # Get current time
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests for this client
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > minute_ago
        ]
        
        # Check rate limit
        if len(self.requests[client_id]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute."
            )
        
        # Add current request
        self.requests[client_id].append(now)
        
        # Cleanup old entries periodically
        if not self.cleanup_task or self.cleanup_task.done():
            self.cleanup_task = asyncio.create_task(self.cleanup_old_entries())
        
        response = await call_next(request)
        return response
    
    async def cleanup_old_entries(self):
        """Remove old entries to prevent memory leak"""
        await asyncio.sleep(300)  # Clean every 5 minutes
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Remove clients with no recent requests
        clients_to_remove = [
            client_id for client_id, requests in self.requests.items()
            if not requests or all(req_time <= minute_ago for req_time in requests)
        ]
        
        for client_id in clients_to_remove:
            del self.requests[client_id]
