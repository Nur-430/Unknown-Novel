const SUPABASE_URL = "https://oedymlrxlthmlgyrgvzp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZHltbHJ4bHRobWxneXJndnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDIxODQsImV4cCI6MjA4NTUxODE4NH0.E3oBmIDdPE0x7rBDuR5ag-c14aWTZL28nnO_7TUVd44";

// Initialize Supabase client
console.log("Initializing Supabase with URL:", SUPABASE_URL);

try {
  // SDK exposes createClient on window.supabase
  const { createClient } = window.supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Assign to both names for compatibility across all pages
  window.supabaseClient = client;
  window.supabase = client;
  console.log("Supabase client initialized successfully");
} catch (err) {
  console.error("Critical error during Supabase initialization:", err);
}

