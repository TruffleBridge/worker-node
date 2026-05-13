import { body, validationResult } from 'express-validator';
import type { ValidationChain } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

export const validateRegister = (): ValidationChain[] => {
  return [
    body('firstname')
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters'),
    body('lastname')
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phonenumber')
      .notEmpty()
      .withMessage('Phone number is required')
      // .isMobilePhone()
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

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  console.log("errors", errors)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
