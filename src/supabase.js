import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://htgdxtiufksxoahyuief.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2R4dGl1ZmtzeG9haHl1aWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTE0ODIsImV4cCI6MjA5Nzc4NzQ4Mn0.zO6tD_LMZtQfQBbtqeISknFbXSZ1oYWWVpJmFSDQKLU'

export const supabase = createClient(supabaseUrl, supabaseKey)