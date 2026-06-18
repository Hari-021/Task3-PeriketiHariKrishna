from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pymongo import MongoClient

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path)

DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite").lower()

# --- SQLite Configuration ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./restaurant.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enforce foreign key constraints in SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# --- MongoDB Configuration ---
mongo_client = None
mongo_db = None

if DATABASE_TYPE == "mongodb":
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB = os.getenv("MONGO_DB", "restaurant_order_management")
    mongo_client = MongoClient(MONGO_URI)
    mongo_db = mongo_client[MONGO_DB]

# Dependency to get db session/client database
def get_db():
    if DATABASE_TYPE == "mongodb":
        # PyMongo's database client is thread-safe and manages its own connection pool
        yield mongo_db
    else:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

