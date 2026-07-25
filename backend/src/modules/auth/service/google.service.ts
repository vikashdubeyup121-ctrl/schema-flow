export interface GoogleProfile {
  email: string;
  name: string;
  pictureUrl?: string;
}

export class GoogleService {
  async getTokens(code: string): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
       throw new Error('Google OAuth env variables missing');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google token exchange failed:', errText);
      throw new Error('Failed to exchange Google code: ' + errText);
    }

    const data = await response.json();
    return data.access_token;
  }

  async getProfile(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Google profile');
    }

    const data = await response.json();
    return {
      email: data.email,
      name: data.name,
      pictureUrl: data.picture,
    };
  }
}
