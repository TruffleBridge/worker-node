import UserRepository from '../repository/UserRepository.js';
import bcrypt from 'bcrypt';
import { buildAuthPayload, sanitizeUser } from '../utils/userResponse.js';
import type { AuthPayload, AuthProvider, OAuthProfileInput } from '../types/auth.js';
import type { Profile } from 'passport';

class UserService {
  async register({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
  }): Promise<Record<string, unknown>> {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserRepository.create({
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      password: hashedPassword,
      authProvider: 'local',
      emailVerified: false,
    });

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Registration failed');
    }

    return sanitizeUser(user);
  }

  async login({ email, password }: { email: string; password: string }): Promise<AuthPayload> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const storedPassword = user.getDataValue('password');
    if (!storedPassword) {
      const provider = user.getDataValue('authProvider');
      throw new Error(
        `This account uses ${provider} sign-in. Please log in with ${provider}.`
      );
    }

    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return buildAuthPayload(user);
  }

  async findOrCreateOAuthUser(input: OAuthProfileInput): Promise<AuthPayload> {
    const { provider, providerId, email, firstName, lastName, profilePicture, emailVerified } =
      input;

    const existingByProvider =
      (await UserRepository.findByProvider(provider, providerId)) ||
      (await UserRepository.findByProviderId(providerId));
    if (existingByProvider) {
      const userId = existingByProvider.getDataValue('id') as number;
      const updated = await UserRepository.update(userId, {
        firstName,
        lastName,
        profilePicture: profilePicture ?? existingByProvider.getDataValue('profilePicture'),
        emailVerified: emailVerified ?? existingByProvider.getDataValue('emailVerified'),
      });
      return buildAuthPayload(updated!);
    }

    if (email) {
      const existingByEmail = await UserRepository.findByEmail(email);
      if (existingByEmail) {
        const existingProvider = existingByEmail.getDataValue('authProvider') as AuthProvider;
        const existingProviderId = existingByEmail.getDataValue('providerId');

        if (existingProvider !== 'local' && existingProvider !== provider) {
          throw new Error(
            'An account with this email already exists with a different sign-in method.'
          );
        }

        if (existingProviderId && existingProviderId !== providerId) {
          throw new Error('This email is linked to a different social account.');
        }

        const userId = existingByEmail.getDataValue('id') as number;
        const updated = await UserRepository.update(userId, {
          authProvider: provider,
          providerId,
          profilePicture: profilePicture ?? existingByEmail.getDataValue('profilePicture'),
          emailVerified: emailVerified ?? true,
          firstName: existingByEmail.getDataValue('firstName') || firstName,
          lastName: existingByEmail.getDataValue('lastName') || lastName,
        });
        return buildAuthPayload(updated!);
      }
    }

    if (!email) {
      throw new Error(
        'Email permission is required. Please allow email access from your social account.'
      );
    }

    const newUser = await UserRepository.create({
      firstName,
      lastName,
      email,
      authProvider: provider,
      providerId,
      profilePicture: profilePicture ?? null,
      emailVerified: emailVerified ?? true,
      password: null,
      phone: null,
    });

    return buildAuthPayload(newUser);
  }

  mapGoogleProfile(profile: Profile): OAuthProfileInput {
    const email = profile.emails?.[0]?.value;
    return {
      provider: 'google',
      providerId: profile.id,
      email,
      firstName: profile.name?.givenName || profile.displayName || 'User',
      lastName: profile.name?.familyName || '',
      profilePicture: profile.photos?.[0]?.value,
      emailVerified: true,
    };
  }

  mapFacebookProfile(profile: Profile): OAuthProfileInput {
    const email = profile.emails?.[0]?.value;
    const nameParts = (profile.displayName || '').split(' ');
    const firstName = profile.name?.givenName || nameParts[0] || 'User';
    const lastName = profile.name?.familyName || nameParts.slice(1).join(' ') || '';

    return {
      provider: 'facebook',
      providerId: profile.id,
      email,
      firstName,
      lastName,
      profilePicture: profile.photos?.[0]?.value,
      emailVerified: !!email,
    };
  }

  async handleOAuthProfile(provider: AuthProvider, profile: Profile): Promise<AuthPayload> {
    const input =
      provider === 'google'
        ? this.mapGoogleProfile(profile)
        : this.mapFacebookProfile(profile);
    return this.findOrCreateOAuthUser(input);
  }

  async verifyGoogleIdToken(idToken: string): Promise<AuthPayload> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Google OAuth is not configured');
    }

    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new Error('Invalid Google token');
    }

    return this.findOrCreateOAuthUser({
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      firstName: payload.given_name || payload.name || 'User',
      lastName: payload.family_name || '',
      profilePicture: payload.picture,
      emailVerified: payload.email_verified ?? true,
    });
  }

  async verifyFacebookAccessToken(accessToken: string): Promise<AuthPayload> {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error('Facebook OAuth is not configured');
    }

    const appToken = `${appId}|${appSecret}`;
    const debugUrl = new URL('https://graph.facebook.com/debug_token');
    debugUrl.searchParams.set('input_token', accessToken);
    debugUrl.searchParams.set('access_token', appToken);

    const debugResponse = await fetch(debugUrl.toString());
    const debugData = (await debugResponse.json()) as {
      data?: { is_valid?: boolean; user_id?: string };
    };

    if (!debugData.data?.is_valid || !debugData.data.user_id) {
      throw new Error('Invalid Facebook token');
    }

    const profileUrl = new URL('https://graph.facebook.com/me');
    profileUrl.searchParams.set(
      'fields',
      'id,email,first_name,last_name,picture.type(large)'
    );
    profileUrl.searchParams.set('access_token', accessToken);

    const profileResponse = await fetch(profileUrl.toString());
    const profile = (await profileResponse.json()) as {
      id?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      picture?: { data?: { url?: string } };
      error?: { message?: string };
    };

    if (profile.error || !profile.id) {
      throw new Error(profile.error?.message || 'Failed to fetch Facebook profile');
    }

    return this.findOrCreateOAuthUser({
      provider: 'facebook',
      providerId: profile.id,
      email: profile.email,
      firstName: profile.first_name || 'User',
      lastName: profile.last_name || '',
      profilePicture: profile.picture?.data?.url,
      emailVerified: !!profile.email,
    });
  }
}

export default new UserService();
