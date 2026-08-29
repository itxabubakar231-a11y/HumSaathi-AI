import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("humsaathi-database")

db_url = settings.clean_database_url

connect_args = {}
engine_kwargs = {"pool_pre_ping": True}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Serverless-friendly connection timeout & pool settings
    connect_args = {"connect_timeout": 5}
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 2,
        "pool_timeout": 5,
        "pool_recycle": 300,
    })

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_tables_initialized = False

def init_db_tables():
    """Lazily ensure tables exist without blocking module import or crashing on cold start."""
    global _tables_initialized
    if _tables_initialized:
        return
    _tables_initialized = True
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"Non-blocking database initialization notice: {e}")

def get_db():
    init_db_tables()
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass

