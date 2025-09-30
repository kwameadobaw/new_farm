/*
  # Farm Visit Management System Schema

  ## Overview
  This migration creates the complete database schema for a farm visit management system.

  ## New Tables

  ### 1. `farm_visits`
  Main table storing all farm visit records with comprehensive details.
  
  **Farmer Details:**
  - `id` (uuid, primary key) - Unique identifier for each visit
  - `farmer_name` (text) - Name of the farmer
  - `farm_id` (text) - Unique farm identifier
  - `phone_number` (text) - Contact phone number
  - `village_location` (text) - Village or location name
  - `gps_coordinates` (text) - GPS coordinates of the farm
  - `farm_size_acres` (numeric) - Farm size in acres
  - `farm_type` (text) - Type: Crop, Livestock, or Mixed
  
  **Visit Details:**
  - `visit_date` (date) - Date of the visit
  - `visit_type` (text) - Type: Routine, Emergency, or Follow-up
  - `officer_name` (text) - Name of visiting officer
  - `time_spent_hours` (numeric) - Duration of visit in hours
  
  **Observations:**
  - `main_crops` (text) - Primary crops grown
  - `crop_stage` (text) - Current growth stage
  - `livestock_type` (text) - Types of livestock
  - `number_of_animals` (integer) - Total animal count
  - `crop_issues` (text[]) - Array of crop-related issues
  - `livestock_issues` (text[]) - Array of livestock-related issues
  - `photo_url` (text) - URL to uploaded photo
  - `video_link` (text) - Link to video
  
  **Recommendations:**
  - `advice_given` (text) - Recommendations provided
  
  **Follow-up:**
  - `follow_up_needed` (boolean) - Whether follow-up is required
  - `proposed_follow_up_date` (date) - Scheduled follow-up date
  - `training_needed` (boolean) - Whether training is required
  - `referral_to_specialist` (text) - Referral details
  - `additional_notes` (text) - Extra notes
  
  **Metadata:**
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `admin_users`
  Stores admin credentials for accessing the admin dashboard.
  
  - `id` (uuid, primary key) - Unique identifier
  - `username` (text, unique) - Admin username
  - `password_hash` (text) - Hashed password
  - `created_at` (timestamptz) - Account creation timestamp

  ### 3. `crop_stages`
  Stores crop-specific growth stages for dynamic form generation.
  
  - `id` (uuid, primary key) - Unique identifier
  - `crop_name` (text) - Name of the crop
  - `stages` (text[]) - Array of growth stages for this crop
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public can insert farm visits (for field officers)
  - Public can read farm visits (for admin dashboard)
  - Only authenticated users can delete farm visits
  - Admin users table has restricted access policies

  ## Important Notes
  1. The system allows anonymous submissions for farm visits (field use)
  2. Admin authentication is handled via the admin_users table
  3. Photos are stored via URLs (Supabase Storage integration)
  4. Crop stages are pre-populated with examples for Onion and Rice
*/

-- Create farm_visits table
CREATE TABLE IF NOT EXISTS farm_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Farmer Details
  farmer_name text NOT NULL,
  farm_id text NOT NULL,
  phone_number text NOT NULL,
  village_location text NOT NULL,
  gps_coordinates text,
  farm_size_acres numeric NOT NULL,
  farm_type text NOT NULL CHECK (farm_type IN ('Crop', 'Livestock', 'Mixed')),
  
  -- Visit Details
  visit_date date NOT NULL,
  visit_type text NOT NULL CHECK (visit_type IN ('Routine', 'Emergency', 'Follow-up')),
  officer_name text NOT NULL,
  time_spent_hours numeric NOT NULL,
  
  -- Observations
  main_crops text,
  crop_stage text,
  livestock_type text,
  number_of_animals integer,
  crop_issues text[],
  livestock_issues text[],
  photo_url text,
  video_link text,
  
  -- Recommendations
  advice_given text NOT NULL,
  
  -- Follow-up
  follow_up_needed boolean DEFAULT false,
  proposed_follow_up_date date,
  training_needed boolean DEFAULT false,
  referral_to_specialist text,
  additional_notes text,
  
  -- Metadata
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create crop_stages table
CREATE TABLE IF NOT EXISTS crop_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text UNIQUE NOT NULL,
  stages text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE farm_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farm_visits
CREATE POLICY "Anyone can insert farm visits"
  ON farm_visits FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read farm visits"
  ON farm_visits FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can delete farm visits"
  ON farm_visits FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for admin_users
CREATE POLICY "Anyone can read admin users for authentication"
  ON admin_users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for crop_stages
CREATE POLICY "Anyone can read crop stages"
  ON crop_stages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage crop stages"
  ON crop_stages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample crop stages
INSERT INTO crop_stages (crop_name, stages) VALUES
  ('Onion', ARRAY[
    'Seed emergence',
    'Germination',
    'Recovering from shock',
    'Vegetative',
    'Building/Bulb initiation',
    'Bolting',
    'Harvest'
  ]),
  ('Rice', ARRAY[
    'Seed emergence',
    'Germination',
    'Recovering from shock',
    'Tillering',
    'Vegetative',
    'Stem elongation',
    'Booting/Reproductive',
    'Flag leaf initiation',
    'Panicle initiation',
    'Soft/Hard dough',
    'Ripening',
    'Harvest'
  ])
ON CONFLICT (crop_name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farm_visits_visit_type ON farm_visits(visit_type);
CREATE INDEX IF NOT EXISTS idx_farm_visits_visit_date ON farm_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_farm_visits_farmer_name ON farm_visits(farmer_name);
CREATE INDEX IF NOT EXISTS idx_farm_visits_farm_id ON farm_visits(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_stages_crop_name ON crop_stages(crop_name);