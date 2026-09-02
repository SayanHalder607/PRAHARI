"""
PRAHARI Database Seeder
Creates demo users and personnel profiles for hackathon demonstration
"""

import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, PersonnelProfile
from auth import get_password_hash


def seed_database():
    """Create demo data if database is empty."""
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).count() > 0:
            print("Database already seeded, skipping.")
            return

        print("Seeding database with demo data...")

        # Create personnel profiles
        profiles = []
        profile_data = [
            ("PRAH-1001", "Constable", "Alpha Company", "Urban"),
            ("PRAH-1002", "Head Constable", "Bravo Company", "Border"),
            ("PRAH-1003", "Sub-Inspector", "Charlie Company", "High-Altitude"),
            ("PRAH-1004", "Inspector", "Delta Company", "Rural"),
            ("PRAH-1005", "Constable", "Echo Company", "Urban"),
            ("PRAH-1006", "Head Constable", "Alpha Company", "Border"),
            ("PRAH-1007", "Sub-Inspector", "Bravo Company", "Rural"),
            ("PRAH-1008", "Constable", "Charlie Company", "High-Altitude"),
            ("PRAH-1009", "Inspector", "Delta Company", "Urban"),
            ("PRAH-1010", "Deputy Superintendent", "Echo Company", "Border"),
        ]

        for number, rank, unit, deployment in profile_data:
            profile = PersonnelProfile(
                id=str(uuid.uuid4()),
                personnel_number=number,
                rank=rank,
                unit=unit,
                deployment_type=deployment,
                baseline_hr=72.0,
                baseline_hrv=55.0,
                baseline_sleep_hours=7.0,
                baseline_stress=25.0,
            )
            profiles.append(profile)
            db.add(profile)

        db.flush()

        # Create users with different roles
        demo_password = get_password_hash("demo123")

        users = [
            User(
                id=str(uuid.uuid4()),
                username="personnel1",
                email="personnel1@prahari.demo",
                hashed_password=demo_password,
                role="personnel",
                personnel_id=profiles[0].id,
            ),
            User(
                id=str(uuid.uuid4()),
                username="personnel2",
                email="personnel2@prahari.demo",
                hashed_password=demo_password,
                role="personnel",
                personnel_id=profiles[1].id,
            ),
            User(
                id=str(uuid.uuid4()),
                username="welfare1",
                email="welfare1@prahari.demo",
                hashed_password=demo_password,
                role="welfare_officer",
                personnel_id=profiles[2].id,
            ),
            User(
                id=str(uuid.uuid4()),
                username="medical1",
                email="medical1@prahari.demo",
                hashed_password=demo_password,
                role="medical_officer",
                personnel_id=profiles[3].id,
            ),
            User(
                id=str(uuid.uuid4()),
                username="commander1",
                email="commander1@prahari.demo",
                hashed_password=demo_password,
                role="commander",
                personnel_id=profiles[9].id,
            ),
            User(
                id=str(uuid.uuid4()),
                username="admin",
                email="admin@prahari.demo",
                hashed_password=demo_password,
                role="admin",
                personnel_id=None,
            ),
        ]

        for user in users:
            db.add(user)

        db.commit()
        print(f"Seeded {len(profiles)} personnel profiles and {len(users)} users.")
        print("Demo credentials: username=personnel1 password=demo123")
        print("                  username=welfare1   password=demo123")
        print("                  username=commander1 password=demo123")
        print("                  username=admin      password=demo123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_database()
