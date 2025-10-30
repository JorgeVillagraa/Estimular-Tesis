const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log("Supabase client initialized successfully.");
} else {
  console.error("Supabase credentials not found. Please check your .env file.");
  // Exit gracefully if Supabase is not configured
  process.exit(1);
}

module.exports = supabase;
