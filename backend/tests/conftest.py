import pytest
import os
import sys

# Ensure backend directory and project root are in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))

for path in [backend_dir, root_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from app.database.session import SessionLocal, init_db, engine
from app.database.base import Base
import app.models  # ensure models are registered
from scripts.seed_demo_data import seed_database


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure database schema is created and demo data is seeded for tests."""
    init_db()
    seed_database()
    yield


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
