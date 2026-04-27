import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ukkengybjfjqbcpqntzk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_USnPeiTEOCMK1O_RaUjO4Q_b1a39BZw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
