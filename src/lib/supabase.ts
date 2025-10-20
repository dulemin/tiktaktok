import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use production defaults
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mgzzhlftixrxfjakvwua.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nenpobGZ0aXhyeGZqYWt2d3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDg1MTcsImV4cCI6MjA3NjIyNDUxN30.Ax5FFbi7_GPP5vhCKTfhodH_Zep7xFzMHQOg-EIcsMw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
