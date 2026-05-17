export type AuthProvider = 'local' | 'google' | 'facebook';

export interface AuthPayload {
  user: Record<string, unknown>;
  accessToken: string;
}

export interface OAuthProfileInput {
  provider: AuthProvider;
  providerId: string;
  email?: string | undefined;
  firstName: string;
  lastName: string;
  profilePicture?: string | undefined;
  emailVerified?: boolean | undefined;
}
