-- =============================================================
-- Add reservations_url column to restaurants
-- =============================================================

alter table restaurants add column if not exists reservations_url text;

-- Allow staff to update this field too
