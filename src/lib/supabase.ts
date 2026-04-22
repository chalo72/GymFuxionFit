import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yaeoyqcculiovxwehztn.supabase.co';
const supabaseAnonKey = 'sb_publishable_CGc4NGNg4aVIqG6aFGwPYA_riYQtw7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
