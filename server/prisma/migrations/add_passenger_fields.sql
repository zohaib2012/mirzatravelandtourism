-- Run this SQL manually on your Neon database if prisma migrate fails
ALTER TABLE passengers
  ADD COLUMN IF NOT EXISTS title VARCHAR(10),
  ADD COLUMN IF NOT EXISTS surname VARCHAR(255),
  ADD COLUMN IF NOT EXISTS passport_expiry DATE,
  ADD COLUMN IF NOT EXISTS passport_front_url TEXT,
  ADD COLUMN IF NOT EXISTS passport_back_url TEXT;
