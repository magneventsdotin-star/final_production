
export type AdminRole = 'admin' | 'super_admin';

export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
}

export interface Artist {
  id: string;
  name: string;
  alias: string;
  category: string;
  sub_categories: string[];
  languages: string[];
  bio: string;
  price_min: number;
  price_max: number;
  members_min: number;
  members_max: number;
  performance_duration: string;
  rating: number;
  successful_bookings: number;
  city: string;
  state: string;
  locality?: string;
  address?: string;
  is_featured: boolean;
  is_trending: boolean;
  is_artist_of_month: boolean;
  contact_person: string;
  phone_no: string;
  phone_no_alt?: string;
  email: string;
  video_url?: string;
  cover_image_url?: string;
  created_by_admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface ArtistMedia {
  id: string;
  artist_id: string;
  media_type: 'photo' | 'video';
  r2_object_key: string;
  public_url: string;
  created_at: string;
}
