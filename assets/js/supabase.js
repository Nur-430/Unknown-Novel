const SUPABASE_URL = "https://nbdqvvhoqbahkfzwkppw.supabase.co";
const SUPABASE_KEY = "sb_publishable_f_SXDmpiAE0l0qYthRvBCw_WJmvA43U";

// Test if URL is reachable
console.log("Initializing Supabase with URL:", SUPABASE_URL);

if (typeof supabaseClient === 'undefined') {
  try {
    window.supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
    window.supabase = window.supabaseClient;
    console.log("Supabase client initialized successfully");
  } catch (err) {
    console.error("Critical error during Supabase initialization:", err);
  }
}

