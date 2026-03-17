# app/core/rate_limit.py

import time
import redis
from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

# -----------------------------
# Redis Client (global, reused)
# -----------------------------
redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    db=settings.redis_db,
    decode_responses=True,
)

WINDOW_SECONDS = 60
GLOBAL_RATE_LIMIT_KEY = "global"


# -----------------------------
# Custom Exception (REQUIRED by recommend.py)
# -----------------------------
class RateLimitError(Exception):
    """Raised when rate limit is exceeded."""
    pass


# -----------------------------
# Core Rate Limit Check
# -----------------------------
def _check_request_limit(scope: str) -> None:
    """
    Enforces a shared requests-per-minute limit using Redis atomic counters.
    """

    try:
        now = int(time.time())
        window = now // WINDOW_SECONDS

        req_key = f"rl:req:{scope}:{window}"
        req_count = redis_client.incr(req_key)

        if req_count == 1:
            redis_client.expire(req_key, WINDOW_SECONDS)

        if req_count > settings.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Requests per minute exceeded",
            )
    except redis.RedisError:
        # FAIL-OPEN (important for production resilience)
        return


def _check_token_limit(scope: str, tokens_used: int) -> None:
    """
    Enforces a shared tokens-per-minute limit using Redis atomic counters.
    """

    if tokens_used <= 0:
        return

    try:
        now = int(time.time())
        window = now // WINDOW_SECONDS

        tok_key = f"rl:tok:{scope}:{window}"
        tok_count = redis_client.incrby(tok_key, tokens_used)

        if tok_count == tokens_used:
            redis_client.expire(tok_key, WINDOW_SECONDS)

        if tok_count > settings.tokens_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Tokens per minute exceeded",
            )

    except redis.RedisError:
        # FAIL-OPEN (important for production resilience)
        return


# -----------------------------
# Wrapper Class (REQUIRED by recommend.py)
# -----------------------------
class RateLimiter:
    """
    Wrapper expected by recommend.py.
    Applies shared app-wide request and token limits.
    """

    def __init__(self):
        pass

    def check_request(self):
        """Check the shared request-per-minute limit."""
        try:
            _check_request_limit(GLOBAL_RATE_LIMIT_KEY)
        except HTTPException as e:
            raise RateLimitError(e.detail)

    def check_tokens(self, tokens: int):
        """Check the shared token-per-minute limit."""
        try:
            _check_token_limit(GLOBAL_RATE_LIMIT_KEY, tokens)
        except HTTPException as e:
            raise RateLimitError(e.detail)


# -----------------------------
# FastAPI Middleware
# -----------------------------
class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware that applies the same shared app-wide rate limit to every request.
    """

    async def dispatch(self, request: Request, call_next):
        # skip health checks
        if request.url.path == "/health":
            return await call_next(request)

        _check_request_limit(GLOBAL_RATE_LIMIT_KEY)

        # continue request
        response = await call_next(request)
        return response
