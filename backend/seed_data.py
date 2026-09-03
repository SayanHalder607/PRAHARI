"""
PRAHARI Database Seeder
Creates demo users and personnel profiles for hackathon demonstration
"""

import uuid
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, PersonnelProfile, StressPrediction, WearableReading, SleepRecord, DutyRecord
from auth import get_password_hash


def seed_database():
    """Create demo data if database is empty."""
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            profiles = db.query(PersonnelProfile).all()
            now = datetime.utcnow()

            # Seed 7-day historical StressPredictions if missing
            if db.query(StressPrediction).count() < 10:
                print("Seeding missing 7-day stress predictions for all profiles...")
                for p in profiles:
                    base = p.baseline_stress or 25.0
                    for day_offset in range(6, -1, -1):
                        day_time = now - timedelta(days=day_offset, hours=2)
                        variation = np.sin(day_offset * 1.1) * 7.5 + np.random.uniform(-3, 3)
                        psi_val = round(max(12.0, min(80.0, base + variation)), 1)
                        tier = "self_awareness" if psi_val < 35 else ("peer_support" if psi_val < 65 else "command_action")
                        trend_direction = "stable" if abs(variation) < 4 else ("increasing" if variation > 0 else "decreasing")

                        pred = StressPrediction(
                            id=str(uuid.uuid4()),
                            personnel_id=p.id,
                            timestamp=day_time,
                            psi_score=psi_val,
                            confidence=0.94,
                            risk_tier=tier,
                            contributing_factors={
                                "Sleep duration": round(float(np.random.uniform(5.5, 7.5)), 1),
                                "Workload intensity": round(float(np.random.uniform(4.0, 8.0)), 1),
                                "HRV ratio": round(float(np.random.uniform(0.75, 1.1)), 2),
                            },
                            trend=trend_direction,
                            physiological_score=round(psi_val * 0.9, 1),
                            facial_score=round(psi_val * 0.8, 1),
                            sleep_score=round(psi_val * 1.05, 1),
                            workload_score=round(psi_val * 1.1, 1),
                            psychometric_score=round(psi_val * 0.95, 1),
                            historical_score=round(base, 1),
                        )
                        db.add(pred)
                db.commit()

            # Seed WearableReading if missing
            if db.query(WearableReading).count() == 0:
                print("Seeding missing wearable readings...")
                for p in profiles:
                    for i in range(15):
                        t = now - timedelta(minutes=(15 - i) * 5)
                        reading = WearableReading(
                            id=str(uuid.uuid4()),
                            personnel_id=p.id,
                            timestamp=t,
                            heart_rate=round(float(np.random.normal(p.baseline_hr or 72.0, 3)), 1),
                            hrv=round(float(np.random.normal(p.baseline_hrv or 55.0, 4)), 1),
                            spo2=round(float(np.random.normal(97.8, 0.4)), 1),
                            eda=round(float(np.random.normal(2.4, 0.4)), 2),
                            skin_temperature=round(float(np.random.normal(36.6, 0.2)), 1),
                            accelerometer_x=round(float(np.random.normal(0, 0.05)), 3),
                            accelerometer_y=round(float(np.random.normal(0, 0.05)), 3),
                            accelerometer_z=round(float(np.random.normal(1, 0.05)), 3),
                            activity_level=round(float(np.random.uniform(0.1, 0.3)), 2),
                            step_count=int(np.random.randint(5, 30)),
                        )
                        db.add(reading)
                db.commit()

            # Seed SleepRecord if missing
            if db.query(SleepRecord).count() == 0:
                print("Seeding missing sleep records...")
                for p in profiles:
                    for d in range(7):
                        st = now - timedelta(days=d)
                        dur = round(float(np.random.uniform(6.2, 8.1)), 1)
                        eff = round(float(np.random.uniform(78.0, 93.0)), 1)
                        slp = SleepRecord(
                            id=str(uuid.uuid4()),
                            personnel_id=p.id,
                            date=st,
                            sleep_duration=dur,
                            sleep_efficiency=eff,
                            interruptions=int(np.random.randint(1, 4)),
                            deep_sleep_percentage=round(float(np.random.uniform(18.0, 25.0)), 1),
                            rem_sleep_percentage=round(float(np.random.uniform(20.0, 26.0)), 1),
                            sleep_debt=max(0.0, round(float(p.baseline_sleep_hours - dur), 1)),
                        )
                        db.add(slp)
                db.commit()

            # Seed DutyRecord if missing
            if db.query(DutyRecord).count() == 0:
                print("Seeding missing duty records...")
                for p in profiles:
                    for d in range(7):
                        dt = now - timedelta(days=d)
                        duty = DutyRecord(
                            id=str(uuid.uuid4()),
                            personnel_id=p.id,
                            date=dt,
                            duty_hours=round(float(np.random.uniform(8.0, 11.5)), 1),
                            consecutive_days=d + 1,
                            night_shift=(d % 3 == 0),
                            operational_intensity=round(float(np.random.uniform(3.0, 6.5)), 1),
                            break_duration=round(float(np.random.uniform(1.0, 2.5)), 1),
                            time_since_rest=round(float(np.random.uniform(2.0, 5.0)), 1),
                        )
                        db.add(duty)
                db.commit()

            print("Database fully seeded with all example datasets (wearables, sleep, duty, predictions).")
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

        now = datetime.utcnow()
        for p in profiles:
            base = p.baseline_stress or 25.0
            for day_offset in range(6, -1, -1):
                day_time = now - timedelta(days=day_offset, hours=2)
                variation = np.sin(day_offset * 1.1) * 7.5 + np.random.uniform(-3, 3)
                psi_val = round(max(12.0, min(80.0, base + variation)), 1)
                tier = "self_awareness" if psi_val < 35 else ("peer_support" if psi_val < 65 else "command_action")
                trend_direction = "stable" if abs(variation) < 4 else ("increasing" if variation > 0 else "decreasing")

                pred = StressPrediction(
                    id=str(uuid.uuid4()),
                    personnel_id=p.id,
                    timestamp=day_time,
                    psi_score=psi_val,
                    confidence=0.94,
                    risk_tier=tier,
                    contributing_factors={
                        "Sleep duration": round(np.random.uniform(5.5, 7.5), 1),
                        "Workload intensity": round(np.random.uniform(4.0, 8.0), 1),
                        "HRV ratio": round(np.random.uniform(0.75, 1.1), 2),
                    },
                    trend=trend_direction,
                    physiological_score=round(psi_val * 0.9, 1),
                    facial_score=round(psi_val * 0.8, 1),
                    sleep_score=round(psi_val * 1.05, 1),
                    workload_score=round(psi_val * 1.1, 1),
                    psychometric_score=round(psi_val * 0.95, 1),
                    historical_score=round(base, 1),
                )
                db.add(pred)

        db.commit()
        print(f"Seeded {len(profiles)} personnel profiles, {len(users)} users, and 7-day historical trend predictions.")
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
