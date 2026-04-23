-- Initialize FreightClub PostgreSQL schema
CREATE SCHEMA IF NOT EXISTS freightclub;
SET search_path TO freightclub, public;

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;
