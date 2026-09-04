import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "sih26132_python.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def test_database():
    connection = get_connection()

    try:
        cursor = connection.execute(
            "SELECT name FROM sqlite_master "
            "WHERE type='table' ORDER BY name"
        )

        tables = [row["name"] for row in cursor.fetchall()]

        print("KisanLink Python Database")
        print("=========================")
        print(f"Database: {DB_PATH}")
        print("Connection: SUCCESS")
        print("Tables:")

        for table in tables:
            print(f"  - {table}")

    finally:
        connection.close()


if __name__ == "__main__":
    test_database()
