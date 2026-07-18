import { supabase } from '@database/connection/supabase';

export async function generateMetadata({ params }) {
  const decodedId = decodeURIComponent(params.id);
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedId);
  
  let query = supabase.from('artists').select('name, alias, bio, artist_images(image_url)').eq('is_live', true);
  if (isUUID) {
    query = query.eq('id', decodedId);
  } else {
    query = query.or(`alias.ilike.%${decodedId}%,name.ilike.%${decodedId}%`);
  }
  
  const { data } = await query.limit(1).single();

  const name = data?.alias || data?.name || 'Live Artist';
  const description = data?.bio ? data.bio.substring(0, 160) : `Book ${name} for your next event. Hire premium live entertainment and musicians for weddings, corporate events, and private parties via Magnevents.`;
  const image = data?.artist_images?.[0]?.image_url || '/icon-512.png';

  return {
    title: `Hire ${name} | Book Live Artist & Musician Online`,
    description,
    openGraph: {
      title: `Hire ${name} | Book Live Artist & Musician Online`,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Magnevents`,
      description,
      images: [image],
    }
  };
}

export default async function ArtistLayout({ children, params }) {
  const decodedId = decodeURIComponent(params.id);
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedId);
  
  let query = supabase.from('artists').select('name, alias, bio, artist_images(image_url), category, city').eq('is_live', true);
  if (isUUID) {
    query = query.eq('id', decodedId);
  } else {
    query = query.or(`alias.ilike.%${decodedId}%,name.ilike.%${decodedId}%`);
  }
  
  const { data } = await query.limit(1).single();
  const name = data?.alias || data?.name || 'Live Artist';
  const image = data?.artist_images?.[0]?.image_url || '/icon-512.png';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "description": data?.bio || "Live performer available for booking",
    "image": image,
    "jobTitle": data?.category || "Artist",
    "url": `https://www.magnevents.in/artist/${params.id}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
