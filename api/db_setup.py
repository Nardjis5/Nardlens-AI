"""
@file api/db_setup.py
@description Auto-provisioning script for PostgreSQL database setup.
Runs on FastAPI application startup to ensure the database, user, and schema
exist before accepting any connections. Eliminates manual DBA steps for development
and production cold-start deployments.
"""

import os
import re
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

import urllib.parse

def parse_database_url(url: str) -> dict:
    """
    Parses a standard PostgreSQL connection URL into its components using urllib.
    Supports postgres:// and postgresql:// formats.
    """
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ["postgres", "postgresql"]:
        raise ValueError(f"Invalid DATABASE_URL format: {url}")
    
    path = parsed.path.lstrip('/')
    db_name = path.split('?')[0]
    
    return {
        "user": parsed.username or "",
        "password": parsed.password or "",
        "host": parsed.hostname or "127.0.0.1",
        "port": parsed.port or 5432,
        "database": db_name,
    }

def auto_setup_database():
    """
    Connects to the default 'postgres' maintenance database as the system superuser
    and auto-creates the application database and role if they do not already exist.
    This function is safe to call on every startup (idempotent).
    """
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("[DB Setup] No DATABASE_URL found. Skipping auto-setup.")
        return

    try:
        config = parse_database_url(db_url)
    except ValueError as e:
        print(f"[DB Setup] {e}")
        return

    target_db = config["database"]
    target_user = config["user"]
    target_password = config["password"]

    print(f"[DB Setup] Checking database '{target_db}' on {config['host']}:{config['port']}...")

    # Step 1: Try connecting directly to the target database
    try:
        conn = psycopg2.connect(
            dbname=target_db,
            user=target_user,
            password=target_password,
            host=config["host"],
            port=config["port"],
        )
        conn.close()
        print(f"[DB Setup] ✅ Database '{target_db}' already exists and is accessible.")
        return
    except psycopg2.OperationalError:
        pass  # Database doesn't exist yet — proceed to create it

    # Step 2: Connect to default 'postgres' maintenance DB to create the new one
    # Try multiple common superuser fallbacks
    superuser_candidates = [
        {"user": "postgres", "password": target_password},
        {"user": "postgres", "password": ""},
        {"user": target_user, "password": target_password},
    ]

    admin_conn = None
    for creds in superuser_candidates:
        try:
            admin_conn = psycopg2.connect(
                dbname="postgres",
                user=creds["user"],
                password=creds["password"],
                host=config["host"],
                port=config["port"],
            )
            break
        except psycopg2.OperationalError:
            continue

    if not admin_conn:
        print(f"[DB Setup] ⚠️  Could not connect as superuser. Please manually create database '{target_db}'.")
        return

    admin_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = admin_conn.cursor()

    # Create role/user if not exists
    cursor.execute(f"SELECT 1 FROM pg_roles WHERE rolname = %s", (target_user,))
    if not cursor.fetchone():
        cursor.execute(
            f"CREATE USER {target_user} WITH PASSWORD %s",
            (target_password,)
        )
        print(f"[DB Setup] ✅ Created PostgreSQL user '{target_user}'.")
    else:
        print(f"[DB Setup] ℹ️  User '{target_user}' already exists.")

    # Create database if not exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
    if not cursor.fetchone():
        cursor.execute(f'CREATE DATABASE {target_db} OWNER {target_user}')
        cursor.execute(f'GRANT ALL PRIVILEGES ON DATABASE {target_db} TO {target_user}')
        print(f"[DB Setup] ✅ Created database '{target_db}' and granted privileges.")
    else:
        print(f"[DB Setup] ℹ️  Database '{target_db}' already exists.")

    cursor.close()
    admin_conn.close()
    print("[DB Setup] ✅ Database provisioning complete.")
