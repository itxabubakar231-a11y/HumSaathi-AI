import sys
import os

# Ensure backend-python is in the module search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend-python')))

from app.main import app

# Export for ASGI serverless handlers
export_app = app
