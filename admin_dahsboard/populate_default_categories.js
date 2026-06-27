const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categoriesToInsert = [
  { title: 'Book a Singer for House Parties', slug: 'book-a-singer-for-house-parties', status: true, displayOrder: 1 },
  { title: 'Book a Live Band for Wedding', slug: 'book-a-live-band-for-wedding', status: true, displayOrder: 2 },
  { title: 'Hire a Live Band for Corporate Event', slug: 'hire-a-live-band-for-corporate-event', status: true, displayOrder: 3 },
  { title: 'Book Anchor Emcees and Magician', slug: 'book-anchor-emcees-and-magician', status: true, displayOrder: 4 },
  { title: 'Hire Club DJs', slug: 'hire-club-djs', status: true, displayOrder: 5 },
  { title: 'Hire Live Solo Singers', slug: 'hire-live-solo-singers', status: true, displayOrder: 6 },
  { title: 'Background Performance Artists', slug: 'background-performance-artists', status: true, displayOrder: 7 }
];

async function seed() {
  const { data: existing } = await supabase.from('service_categories').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log("Categories already exist. Exiting.");
    return;
  }

  console.log("Inserting default categories...");
  const { error } = await supabase.from('service_categories').insert(categoriesToInsert);
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully inserted default categories!");
  }
}

seed();
