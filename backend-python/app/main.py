import json
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import (
    health,
    users,
    activities,
    progress,
    dashboard,
    conversations,
    skills,
    attempts,
    assessment,
    evaluations,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("humsaathi-api")

app = FastAPI(
    title="HumSaathi AI API",
    description="Adaptive Learning & AI Communication API for Neurodiverse Learners",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResponseEnvelopeMiddleware(BaseHTTPMiddleware):
    """
    Ensures standard JSON envelope format matching the Express backend:
    - Success: {"success": true, "data": {...}}
    - Error: {"success": false, "error": "..."}
    """
    async def dispatch(self, request: Request, call_next):
        # Exclude openapi / docs / root if any
        if request.url.path in ("/docs", "/openapi.json", "/redoc", "/"):
            return await call_next(request)

        try:
            response: Response = await call_next(request)
            
            # If response is already streaming or not JSON, return as is
            content_type = response.headers.get("content-type", "")
            if "application/json" not in content_type:
                return response

            # Read response body
            body_chunks = []
            async for chunk in response.body_iterator:
                if isinstance(chunk, bytes):
                    body_chunks.append(chunk)
                elif isinstance(chunk, str):
                    body_chunks.append(chunk.encode("utf-8"))
            body_bytes = b"".join(body_chunks)

            try:
                data = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                return Response(
                    content=body_bytes,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=response.media_type,
                )

            # If body already has explicit success key, pass through
            if isinstance(data, dict) and ("success" in data):
                return JSONResponse(content=data, status_code=response.status_code)

            # Error responses
            if response.status_code >= 400:
                error_msg = data.get("error") or data.get("detail") or "Request failed"
                if isinstance(error_msg, list):
                    error_msg = "; ".join([str(item.get("msg", item)) for item in error_msg])
                return JSONResponse(
                    content={"success": False, "error": str(error_msg)},
                    status_code=response.status_code,
                )

            # Successful response wrapped in data envelope
            return JSONResponse(
                content={"success": True, "data": data},
                status_code=response.status_code,
            )

        except Exception as exc:
            logger.error(f"Unhandled server error: {exc}", exc_info=True)
            return JSONResponse(
                content={"success": False, "error": "Internal server error"},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

app.add_middleware(ResponseEnvelopeMiddleware)

# Mount all routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(activities.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(evaluations.router, prefix="/api/evaluation")
app.include_router(evaluations.router, prefix="/api/evaluations")
app.include_router(skills.router, prefix="/api")
app.include_router(attempts.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")

@app.get("/")
def root_status():
    return {
        "service": "HumSaathi AI Backend (FastAPI)",
        "status": "online",
        "docs": "/docs",
    }
