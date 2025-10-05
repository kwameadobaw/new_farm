-- Add crop_activities and livestock_activities columns to farm_visits table
ALTER TABLE farm_visits
ADD COLUMN crop_activities text[] DEFAULT '{}',
ADD COLUMN livestock_activities text[] DEFAULT '{}';