from fastapi import Request
from slowapi import Limiter

def get_real_client_ip(request: Request) -> str:
    """Extract real client IP considering reverse proxy headers (e.g. Render, Cloudflare, Vercel)."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

limiter = Limiter(key_func=get_real_client_ip)
