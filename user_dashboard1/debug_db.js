require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data: cats } = await supabase.from('service_categories').select('id, title');
  console.log("Categories:", cats);

  const { data: vids } = await supabase.from('service_videos').select('id, category_id, topic, video_url, user_name');
  console.log("Videos:", vids);
}

check();
