#!/bin/bash
# ============================================================
# NardLens AI - PostgreSQL Auto-Setup Script (Root Version)
# ============================================================
# This script provisions and resets the PostgreSQL database and
# user role 'root' for NardLens AI.
# ============================================================

echo "=== NardLens AI Database Setup ==="
echo "Provisioning and setting database credentials..."
echo "Please enter your system password if prompted by sudo."
echo ""

# 1. Safely create user 'root' if not exists (ignores error if exists)
sudo -u postgres psql -c "CREATE USER root;" 2>/dev/null

# 2. Alter user password and assign superuser role (works even if active!)
sudo -u postgres psql -c "ALTER USER root WITH PASSWORD 'root' SUPERUSER;"

# 3. Create database if not exists
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'nardlens_db';" | grep -q 1
if [ $? -ne 0 ]; then
  sudo -u postgres psql -c "CREATE DATABASE nardlens_db OWNER root;"
  echo "✅ Created database 'nardlens_db'."
else
  echo "ℹ️ Database 'nardlens_db' already exists."
fi

# 4. Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nardlens_db TO root;"

echo ""
echo "✅ Credentials reset complete! User 'root' password is now set to 'root'."
