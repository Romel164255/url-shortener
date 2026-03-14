-- Migration: Add expires_at column to urls table
-- Run this against your PostgreSQL database once

ALTER TABLE urls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT NULL;

-- NULL means the link never expires (fully backwards compatible)
