import { body, validationResult } from 'express-validator';
import type { ValidationChain } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateRegister = (): ValidationChain[] => {
  return [
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .bail()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .bail()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .bail()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .bail()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .bail()
      .withMessage('Valid phone number is required'),
  ];
};

export const validateLogin = (): ValidationChain[] => {
  return [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ];
};

export const validateGoogleToken = (): ValidationChain[] => {
  return [
    body('idToken')
      .notEmpty()
      .withMessage('idToken is required'),
  ];
};

export const validateFacebookToken = (): ValidationChain[] => {
  return [
    body('accessToken')
      .notEmpty()
      .withMessage('accessToken is required'),
  ];
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({
      status: false,
      message: firstError?.msg,
    });
  }
  next();
};
