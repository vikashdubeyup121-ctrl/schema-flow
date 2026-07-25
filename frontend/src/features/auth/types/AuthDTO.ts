export interface LoginWithGoogleRequest {
  token: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string | null;
  };
}
