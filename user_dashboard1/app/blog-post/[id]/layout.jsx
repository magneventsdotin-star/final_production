import { supabase } from '@/app/lib/supabase';
import { defaultBlogs } from '../data';

export async function generateMetadata({ params }) {
  const { id } = params;
  const staticBlog = defaultBlogs.find(b => b.slug === id || b.id === id);
  
  let title = 'Blog | Magnevents';
  let description = 'Read the latest insights and artist news from Magnevents.';
  let image = '/icon-512.png';

  if (staticBlog) {
    title = `${staticBlog.title} | Magnevents`;
    description = staticBlog.subtitle || description;
    image = staticBlog.img || image;
  } else {
    const { data } = await supabase.from('hero_slides').select('title, subtitle, image_url').eq('id', id).single();
    if (data) {
      title = `${data.title} | Magnevents`;
      description = data.subtitle || description;
      image = data.image_url || image;
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    }
  };
}

export default async function BlogLayout({ children, params }) {
  const { id } = params;
  const staticBlog = defaultBlogs.find(b => b.slug === id || b.id === id);
  
  let title = 'Blog Post';
  let description = 'Blog post by Magnevents';
  let image = '/icon-512.png';

  if (staticBlog) {
    title = staticBlog.title;
    description = staticBlog.subtitle || description;
    image = staticBlog.img || image;
  } else {
    const { data } = await supabase.from('hero_slides').select('title, subtitle, image_url').eq('id', id).single();
    if (data) {
      title = data.title;
      description = data.subtitle || description;
      image = data.image_url || image;
    }
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "author": {
      "@type": "Organization",
      "name": "Magnevents"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Magnevents",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.magnevents.in/icon-512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.magnevents.in/blog-post/${id}`
    }
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
