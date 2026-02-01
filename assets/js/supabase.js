const SUPABASE_URL = "https://oedymlrxlthmlgyrgvzp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZHltbHJ4bHRobWxneXJndnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDIxODQsImV4cCI6MjA4NTUxODE4NH0.E3oBmIDdPE0x7rBDuR5ag-c14aWTZL28nnO_7TUVd44";

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

