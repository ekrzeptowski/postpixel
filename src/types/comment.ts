export interface Comment {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
  };
}
