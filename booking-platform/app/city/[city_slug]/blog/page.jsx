import { redirect } from 'next/navigation';

export default async function CityBlogListingRedirect({ params }) {
  const awaitedParams = await params;
  redirect(`/city/${awaitedParams.city_slug}`);
}
