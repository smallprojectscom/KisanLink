import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "sih26132_python.db"


def initialize_database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH)

    try:
        connection.execute("PRAGMA foreign_keys = ON")

        connection.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            mobile TEXT NOT NULL UNIQUE,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            pincode TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer')),
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            verified INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            crop_name TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            price REAL NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'available'
                CHECK(status IN ('available', 'requested', 'sold', 'inactive')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            buyer_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'pending'
                CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            farmer_id INTEGER NOT NULL,
            buyer_id INTEGER NOT NULL,
            quantity REAL NOT NULL,
            agreed_price REAL NOT NULL,
            status TEXT DEFAULT 'active'
                CHECK(status IN ('active', 'completed', 'cancelled')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (farmer_id) REFERENCES users(id),
            FOREIGN KEY (buyer_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            reference_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)

        connection.commit()

    finally:
        connection.close()


def get_connection():
    initialize_database()

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
