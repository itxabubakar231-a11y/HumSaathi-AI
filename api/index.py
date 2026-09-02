import sys
import os

# Ensure backend is in the module search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.database import init_db_tables
try:
    init_db_tables()
except Exception:
    pass

from app.main import app as fastapi_app

async def app(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path.startswith("/api/index.py"):
            stripped = path[len("/api/index.py"):]
            scope["path"] = stripped if stripped else "/"

        headers = dict(scope.get("headers", []))
        matched = headers.get(b"x-matched-path") or headers.get(b"x-vercel-matched-path")
        if matched:
            decoded = matched.decode("utf-8")
            if not decoded.startswith("/api/index.py") and decoded.startswith("/api"):
                scope["path"] = decoded

    await fastapi_app(scope, receive, send)

export_app = app

