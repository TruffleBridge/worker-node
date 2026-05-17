import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import OAuthController from '../controllers/OAuthController.js';
import {
  validateRegister,
  validateLogin,
  validateGoogleToken,
  validateFacebookToken,
  validate,
} from '../validation/UserValidation.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Local auth
router.post('/register', validateRegister(), validate, UserController.register.bind(UserController));
router.post('/login', validateLogin(), validate, UserController.login.bind(UserController));

// Protected profile
router.get('/getProfile', authenticate, UserController.getProfile.bind(UserController));

// Google OAuth (redirect flow)
router.get('/google', OAuthController.googleAuth.bind(OAuthController));
router.get('/google/callback', OAuthController.googleCallback.bind(OAuthController));

// Facebook OAuth (redirect flow)
router.get('/facebook', OAuthController.facebookAuth.bind(OAuthController));
router.get('/facebook/callback', OAuthController.facebookCallback.bind(OAuthController));

// Mobile / SPA token verification
router.post(
  '/google/token',
  validateGoogleToken(),
  validate,
  OAuthController.googleToken.bind(OAuthController)
);
router.post(
  '/facebook/token',
  validateFacebookToken(),
  validate,
  OAuthController.facebookToken.bind(OAuthController)
);

export default router;
