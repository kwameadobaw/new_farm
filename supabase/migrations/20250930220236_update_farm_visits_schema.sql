-- Update farm_visits table to support multiple photos and routine check
ALTER TABLE farm_visits
  -- Rename photo_url to photo_urls and change type to text[]
  DROP COLUMN IF EXISTS photo_url,
  ADD COLUMN photo_urls text[],
  
  -- Add routine check fields
  ADD COLUMN routine_check boolean DEFAULT false,
  ADD COLUMN routine_check_date date;

-- Add comment to explain the changes
COMMENT ON TABLE farm_visits IS 'Farm visits with multiple photo support and routine check option';