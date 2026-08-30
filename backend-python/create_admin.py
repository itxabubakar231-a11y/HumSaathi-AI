"""
HumSaathi AI — Administrator Creation CLI Tool
Usage:
    python create_admin.py
    or
    python create_admin.py --email admin@humsaathi.ai --password SecurePassword123!
"""
import sys
import argparse
import getpass
from datetime import datetime

from app.database import SessionLocal, init_db_tables
from app.models.user import User, Permission, UserPermission
from app.services.auth_service import hash_password
from app.config import settings

def main():
    parser = argparse.ArgumentParser(description="Create or promote an administrator account.")
    parser.add_argument("--email", help="Admin email address")
    parser.add_argument("--password", help="Admin password (min 6 characters)")
    parser.add_argument("--name", default="HumSaathi Administrator", help="Admin full name")
    args = parser.parse_args()

    email = args.email or settings.ADMIN_EMAIL
    password = args.password or settings.ADMIN_PASSWORD

    if not email:
        email = input("Enter Admin Email (e.g. admin@humsaathi.ai): ").strip().lower()
    if not password:
        password = getpass.getpass("Enter Admin Password (min 6 characters): ").strip()

    if not email or "@" not in email:
        print("❌ Error: Please provide a valid email address.")
        sys.exit(1)

    if not password or len(password) < 6:
        print("❌ Error: Password must be at least 6 characters long.")
        sys.exit(1)

    init_db_tables()
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        pw_hash = hash_password(password)

        if user:
            user.role = "ADMIN"
            user.passwordHash = pw_hash
            user.isActive = True
            user.updatedAt = datetime.utcnow()
            print(f"✅ Existing user '{user.email}' has been promoted to ADMIN.")
        else:
            user = User(
                name=args.name.strip() or "HumSaathi Administrator",
                email=email.strip().lower(),
                passwordHash=pw_hash,
                role="ADMIN",
                persona="adult",
                language="en",
                isActive=True,
                setupComplete=True,
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
            )
            db.add(user)
            db.flush()
            print(f"✅ Created new Admin account for '{user.email}'.")

        # Grant standard permissions
        perms = db.query(Permission).all()
        for p in perms:
            existing = (
                db.query(UserPermission)
                .filter(UserPermission.userId == user.id, UserPermission.permissionId == p.id)
                .first()
            )
            if not existing:
                db.add(UserPermission(userId=user.id, permissionId=p.id, grantedBy="CLI"))

        db.commit()
        print("🎉 Administrator account is ready! You can now log in at /login and access /admin.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error setting up administrator: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
