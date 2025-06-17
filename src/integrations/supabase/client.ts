
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjbfhlqmvvvntnkqmfro.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYmZobHFtdnZ2bnRua3FtZnJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjM0ODgsImV4cCI6MjA2NTczOTQ4OH0.XLUkOoU8p9bbLfJILiuTc7CDBl0ie4wfT8nwo1fisOM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
