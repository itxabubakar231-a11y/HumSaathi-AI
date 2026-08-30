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
        ensure_auth_columns()
        seed_foundational_activities()
    except Exception as e:
        logger.warning(f"Non-blocking database initialization notice: {e}")

def ensure_auth_columns():
    """Ensure email, passwordHash, isActive, and lastActiveAt columns exist on User table without data loss."""
    try:
        from sqlalchemy import text
        stmts = [
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" VARCHAR;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" VARCHAR;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS email VARCHAR;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS passwordHash VARCHAR;',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email" VARCHAR;',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" VARCHAR;',
            'ALTER TABLE User ADD COLUMN email VARCHAR;',
            'ALTER TABLE User ADD COLUMN passwordHash VARCHAR;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE;',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS lastActiveAt TIMESTAMP;',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP;',
            'ALTER TABLE User ADD COLUMN isActive BOOLEAN DEFAULT 1;',
            'ALTER TABLE User ADD COLUMN lastActiveAt TIMESTAMP;',
        ]
        for s in stmts:
            try:
                with engine.begin() as conn:
                    conn.execute(text(s))
            except Exception:
                pass
    except Exception as e:
        logger.debug(f"Notice during column verification: {e}")

def seed_foundational_activities():
    """Ensure standard activity, scenario, permission, and initial server-side admin rows exist."""
    try:
        from app.models.activity import Activity
        from app.models.conversation import CommunicationScenario
        from app.models.user import User, Permission, UserPermission
        from app.services.auth_service import hash_password
        from app.schemas.common import stringify_json
        from app.activities.registry import get_activity_content
        from app.data.scenarios import DEFAULT_SCENARIOS

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
            # 1. Activities
            existing_act_ids = {a.id for a in db.query(Activity.id).all()}
            new_activities = []
            for key, defn in topic_defs.items():
                if key not in existing_act_ids:
                    content = get_activity_content(defn['type'], 'easy', 'en')
                    new_activities.append(Activity(
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
                    ))
            if new_activities:
                db.add_all(new_activities)

            # 2. Scenarios
            existing_scenarios = {s.id: s for s in db.query(CommunicationScenario).all()}
            new_scenarios = []
            for s in DEFAULT_SCENARIOS:
                title_val = s['title']['en'] if isinstance(s['title'], dict) else s['title']
                desc_val = s['description']['en'] if isinstance(s['description'], dict) else s['description']
                role_val = s['aiRole']['en'] if isinstance(s['aiRole'], dict) else s['aiRole']
                obj_val = s['objectives']['en'] if isinstance(s['objectives'], dict) else s['objectives']

                if s['id'] not in existing_scenarios:
                    scen = CommunicationScenario(
                        id=s['id'],
                        title=title_val,
                        description=desc_val,
                        aiRole=role_val,
                        personas=stringify_json(s['personas']),
                        languages=stringify_json(s['languages']),
                        difficulty=s['difficulty'],
                        objectives=stringify_json(obj_val),
                        context=s['context'],
                        initialPrompt=stringify_json(s['initialPrompt']),
                        isActive=True,
                        createdAt=datetime.utcnow(),
                    )
                    new_scenarios.append(scen)
                else:
                    existing = existing_scenarios[s['id']]
                    existing.title = title_val
                    existing.description = desc_val
                    existing.aiRole = role_val
                    existing.personas = stringify_json(s['personas'])
                    existing.languages = stringify_json(s['languages'])
                    existing.difficulty = s['difficulty']
                    existing.objectives = stringify_json(obj_val)
                    existing.context = s['context']
                    existing.initialPrompt = stringify_json(s['initialPrompt'])

            if new_scenarios:
                db.add_all(new_scenarios)

            # 3. Standard System Permissions
            standard_permissions = [
                {"id": "manage_users", "name": "User Management", "description": "View, activate, deactivate, delete users and change personas", "category": "Users"},
                {"id": "manage_scenarios", "name": "Scenario Management", "description": "View, enable, disable, and edit practice scenarios", "category": "Content"},
                {"id": "view_analytics", "name": "Analytics & Reports", "description": "View platform usage, persona breakdown, and performance charts", "category": "Analytics"},
                {"id": "view_audit_logs", "name": "View Audit Logs", "description": "View chronological timeline of administrative actions", "category": "Security"},
                {"id": "manage_permissions", "name": "Permissions Management", "description": "Grant and revoke administrative permissions", "category": "Security"},
                {"id": "ai_monitoring", "name": "AI Monitoring", "description": "Inspect aggregate AI session metrics, evaluations, and health", "category": "AI"},
                {"id": "system_settings", "name": "System Settings", "description": "View system health, database status, and configuration", "category": "System"},
            ]
            existing_perm_ids = {p.id for p in db.query(Permission.id).all()}
            for p_def in standard_permissions:
                if p_def["id"] not in existing_perm_ids:
                    db.add(Permission(
                        id=p_def["id"],
                        name=p_def["name"],
                        description=p_def["description"],
                        category=p_def["category"],
                    ))

            # 4. Server-Side Initial Admin Provisioning (Only if configured via environment variables)
            admin_email = (settings.ADMIN_EMAIL or "").strip().lower()
            admin_password = settings.ADMIN_PASSWORD or ""
            if admin_email and admin_password and len(admin_password) >= 6:
                existing_admin = db.query(User).filter(User.email == admin_email).first()
                if not existing_admin:
                    pw_hash = hash_password(admin_password)
                    admin_user = User(
                        name="HumSaathi Administrator",
                        email=admin_email,
                        passwordHash=pw_hash,
                        role="ADMIN",
                        persona="adult",
                        language="en",
                        isActive=True,
                        setupComplete=True,
                        createdAt=datetime.utcnow(),
                        updatedAt=datetime.utcnow(),
                    )
                    db.add(admin_user)
                    db.flush()

                    # Grant all default permissions to initial admin
                    for p_def in standard_permissions:
                        db.add(UserPermission(
                            userId=admin_user.id,
                            permissionId=p_def["id"],
                            grantedBy="SYSTEM",
                        ))

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
