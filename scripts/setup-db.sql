-- Run once as PostgreSQL superuser (postgres)
-- PowerShell:
--   $env:PGPASSWORD = "YOUR_POSTGRES_PASSWORD"
--   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -f scripts/setup-db.sql

CREATE USER pcip WITH PASSWORD 'pcip_secret';

CREATE DATABASE pcip OWNER pcip;

GRANT ALL PRIVILEGES ON DATABASE pcip TO pcip;
