require('dotenv').config({ path: 'admin_dahsboard/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.log("No supabase url");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('analytics').select('*').limit(1);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Table exists! Data:", data);
  }
}

check();
