export type PostRawQuery = {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: string; // e.g. "PUBLISHED"
  type: string; // e.g. "INCIDENT"
  published_at: string | Date;
  incident_id: string;
  created_at: string | Date;
  updated_at: string | Date;
  down_votes: number;
  is_pinned: number;
  is_verified: number;
  score: number;
  views: number;
  keywords: string;
  cover_image_sources: string | null;
  up_votes: number;
  uuid: string;
  location: Uint8Array;
  location_address: string | null;

  /* Author */
  author_id: number;
  author_name: string;
  author_public_id: string;
  author_avatar_url: string | null;

  /* Location */
  location_obj: string | null;

  /* Attached Incident */
  incident_obj: string | null; // JSON string – should be parsed

  /* Current User Votes */
  vote_obj: string | null; // JSON string – should be parsed

  /* PostMedia */
  post_media_obj: string | null;
};

export type IncidentQueryData = {
  id: string;
  image_url: string;
  incident_date: string;
  incident_type_slug: string;
};

export type VoteQueryData = {
  value: number | null;
  userId: number | null;
};

export type LocationObjectQueryData = {
  latitude: number;
  longitude: number;
};

export interface PostMediaQueryData {
  media_id: string;
  display_order: number;
  media_caption: string | null;
  media_sources: Record<string, any> | null;
}
