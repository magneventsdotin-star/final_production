import { supabase } from '@database/connection/supabase';

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const { id } = awaitedParams;
  const decodedId = decodeURIComponent(id);
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedId);
  
  let query = supabase.from('artists').select('name, alias, bio, artist_images(image_url)').eq('is_live', true);
  if (isUUID) {
    query = query.eq('id', decodedId);
  } else {
    const searchTerm = decodedId.replace(/-/g, ' ');
    query = query.or(`alias.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
  }
  
  const { data } = await query.limit(1).single();

  const name = data?.alias || data?.name || 'Live Artist';
  const description = data?.bio ? data.bio.substring(0, 160) : `Book ${name} for your next event. Hire premium live entertainment and musicians for weddings, corporate events, and private parties via Magnevents.`;
  const image = data?.artist_images?.[0]?.image_url || '/icon-512.png';

  return {
    title: `${name} | Book Live Singer | Magnevents`,
    description,
    alternates: {
      canonical: `/artist/${id}`,
    },
    openGraph: {
      title: `${name} | Book Live Singer | Magnevents`,
      description,
      images: [image],
      url: `/artist/${id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Book Live Singer | Magnevents`,
      description,
      images: [image],
    }
  };
}

export default async function ArtistLayout({ children, params }) {
  const awaitedParams = await params;
  const { id } = awaitedParams;
  const decodedId = decodeURIComponent(id);
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedId);
  
  let query = supabase.from('artists').select('name, alias, bio, artist_images(image_url), category, city').eq('is_live', true);
  if (isUUID) {
    query = query.eq('id', decodedId);
  } else {
    const searchTerm = decodedId.replace(/-/g, ' ');
    query = query.or(`alias.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
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
    "url": `https://www.magnevents.in/artist/${id}`
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
