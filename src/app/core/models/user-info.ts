export interface UserInfo {
  user_id?: string;
  preferred_username?: string;
  name?: string;
  email?: string;
  picture?: string;

  [key: string]: any;
}
