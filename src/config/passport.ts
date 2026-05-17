import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import UserService from '../services/UserService.js';
import type { AuthPayload } from '../types/auth.js';
import { logger } from '../utils/logger.js';

export function configurePassport(): void {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (googleClientId && googleClientSecret && googleCallbackUrl) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const result = await UserService.handleOAuthProfile('google', profile);
            done(null, result);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );
  } else {
    logger.warn('Google OAuth is not configured — skipping Google strategy');
  }

  const facebookAppId = process.env.FACEBOOK_APP_ID;
  const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
  const facebookCallbackUrl = process.env.FACEBOOK_CALLBACK_URL;

  if (facebookAppId && facebookAppSecret && facebookCallbackUrl) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: facebookAppId,
          clientSecret: facebookAppSecret,
          callbackURL: facebookCallbackUrl,
          profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const result = await UserService.handleOAuthProfile('facebook', profile);
            done(null, result);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );
  } else {
    logger.warn('Facebook OAuth is not configured — skipping Facebook strategy');
  }

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: AuthPayload, done) => {
    done(null, user);
  });
}

export type PassportAuthResult = AuthPayload;
