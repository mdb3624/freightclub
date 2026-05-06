-- 1. Enable the spatial extension in the new DB
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the specific schema your app expects
CREATE SCHEMA IF NOT EXISTS freightclub;