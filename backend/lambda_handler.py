"""AWS Lambda entry point for the existing FastAPI application."""
from mangum import Mangum
from main import app


handler = Mangum(app, lifespan="auto")
