import os
import sys
import time

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL is not set.", file=sys.stderr)
    sys.exit(1)

engine = create_engine(DATABASE_URL)


def wait_for_db(retries: int = 30, delay: int = 2) -> bool:
    for attempt in range(1, retries + 1):
        try:
            with engine.connect():
                print("Database is available.")
                return True
        except OperationalError as exc:
            print(f"Database unavailable, retry {attempt}/{retries}: {exc}")
            time.sleep(delay)
    return False


if not wait_for_db():
    print("ERROR: Could not connect to the database after retries.", file=sys.stderr)
    sys.exit(1)
