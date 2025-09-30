import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FarmVisit {
  id?: string;
  farmer_name: string;
  farm_id: string;
  phone_number: string;
  village_location: string;
  gps_coordinates?: string;
  farm_size_acres: number;
  farm_type: 'Crop' | 'Livestock' | 'Mixed';
  visit_date: string;
  visit_type: 'Routine' | 'Emergency' | 'Follow-up';
  officer_name: string;
  time_spent_hours: number;
  main_crops?: string;
  crop_stage?: string;
  livestock_type?: string;
  number_of_animals?: number;
  crop_issues?: string[];
  livestock_issues?: string[];
  photo_url?: string;
  video_link?: string;
  advice_given: string;
  follow_up_needed: boolean;
  proposed_follow_up_date?: string;
  training_needed: boolean;
  referral_to_specialist?: string;
  additional_notes?: string;
  created_at?: string;
}

export interface CropStage {
  id: string;
  crop_name: string;
  stages: string[];
  created_at: string;
}
