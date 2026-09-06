import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "sih26132_python.db"

_pg_pool = None


class CompatCursor:
    def __init__(self, cursor, connection):
        self._cursor = cursor
        self._connection = connection

    def __getattr__(self, name):
        return getattr(self._cursor, name)

    @property
    def lastrowid(self):
        row = self._connection._connection.execute(
            "SELECT LASTVAL() AS lastval"
        ).fetchone()
        return row["lastval"] if row else None


class PostgresConnection:
    def __init__(self, connection):
        self._connection = connection
        self._closed = False

    def execute(self, query, params=None):
        query = query.replace("?", "%s")

        if params is None:
            cursor = self._connection.execute(query)
        else:
            cursor = self._connection.execute(query, params)

        return CompatCursor(cursor, self)

    def commit(self):
        self._connection.commit()

    def rollback(self):
        self._connection.rollback()

    def close(self):
        if self._closed:
            return

        self._closed = True

        try:
            self._connection.rollback()
        except Exception:
            pass

        self._connection.close()


def using_postgres():
    return bool(os.getenv("DATABASE_URL"))


def get_postgres_pool():
    global _pg_pool

    if _pg_pool is None:
        import psycopg
        from psycopg.rows import dict_row
        from psycopg_pool import ConnectionPool

        _pg_pool = ConnectionPool(
            conninfo=os.environ["DATABASE_URL"],
            min_size=1,
            max_size=5,
            kwargs={"row_factory": dict_row},
        )

        _pg_pool.wait()

    return _pg_pool


def initialize_sqlite_database():
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


def initialize_postgres_database():
    import psycopg

    connection = psycopg.connect(
        os.environ["DATABASE_URL"]
    )

    try:
        required_tables = [
            "users",
            "products",
            "requests",
            "deals",
            "notifications",
            "history"
        ]

        for table in required_tables:
            result = connection.execute(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = %s
                )
                """,
                (table,)
            ).fetchone()

            if not result[0]:
                raise RuntimeError(
                    f"Supabase table missing: {table}"
                )

    finally:
        connection.close()


def initialize_database():
    if using_postgres():
        initialize_postgres_database()
    else:
        initialize_sqlite_database()


def get_connection():
    if using_postgres():
        import psycopg
        from psycopg.rows import dict_row

        connection = psycopg.connect(
            os.environ["DATABASE_URL"],
            connect_timeout=15,
            row_factory=dict_row
        )

        return PostgresConnection(connection)

    initialize_sqlite_database()

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


def close_postgres_pool():
    pass


def test_database():
    connection = get_connection()

    try:
        if using_postgres():
            cursor = connection.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
                """
            )

            tables = [
                row["table_name"]
                for row in cursor.fetchall()
            ]

            print("KisanLink PostgreSQL Database")
            print("============================")
            print("Database: Supabase PostgreSQL")
            print("Connection: SUCCESS")

        else:
            cursor = connection.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type='table'
                ORDER BY name
                """
            )

            tables = [
                row["name"]
                for row in cursor.fetchall()
            ]

            print("KisanLink SQLite Database")
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
