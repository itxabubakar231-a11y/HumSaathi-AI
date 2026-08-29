import logging
from datetime import datetime
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
    """Lazily ensure tables exist and foundational activity rows exist for relations."""
    global _tables_initialized
    if _tables_initialized:
        return
    _tables_initialized = True
    try:
        import app.models  # noqa: F401
        Base.metadata.create_all(bind=engine)
        seed_foundational_activities()
    except Exception as e:
        logger.warning(f"Non-blocking database initialization notice: {e}")

def seed_foundational_activities():
    """Ensure standard activity rows exist for foreign key relations."""
    try:
        from app.models.activity import Activity
        from app.schemas.common import stringify_json
        from app.activities.registry import get_activity_content

        topic_defs = {
            'letters': {'type': 'letter', 'topic': 'letters', 'title': 'Letter Learning'},
            'numbers': {'type': 'number', 'topic': 'numbers', 'title': 'Number Learning'},
            'colors': {'type': 'shape_color_match', 'topic': 'colors', 'title': 'Shape & Color Match'},
            'shapes': {'type': 'shape_color_match', 'topic': 'shapes', 'title': 'Shape Matching'},
            'counting': {'type': 'counting', 'topic': 'counting', 'title': 'Object Counting'},
            'animals': {'type': 'animal_matching', 'topic': 'animals', 'title': 'Animal Matching'},
            'emotions': {'type': 'emotion_learning', 'topic': 'emotions', 'title': 'Emotion Learning'},
            'routines': {'type': 'routine_sequencing', 'topic': 'routines', 'title': 'Daily Routine Sequence'},
        }

        db = SessionLocal()
        try:
            existing_ids = {a.id for a in db.query(Activity.id).all()}
            new_activities = []
            for key, defn in topic_defs.items():
                if key not in existing_ids:
                    content = get_activity_content(defn['type'], 'easy', 'en')
                    act = Activity(
                        id=key,
                        type=defn['type'],
                        topic=defn['topic'],
                        title=defn['title'],
                        difficulty='easy',
                        language='en',
                        personas=stringify_json(['child', 'teen', 'adult']),
                        content=stringify_json(content),
                        isActive=True,
                        createdAt=datetime.utcnow(),
                    )
                    new_activities.append(act)
            if new_activities:
                db.add_all(new_activities)
                db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Notice during seeding: {e}")

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
