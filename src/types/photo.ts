export interface Photo {
  id: string;
  description: string;
  user_id: string;
  created_at: string;
  album_id: string | null;
  path: string;
  profiles: {
    display_name: string | null;
  };
  albums: {
    name: string;
  } | null;
}

export interface PhotoFilters {
  userId: string | null;
  albumId: string | null;
}
