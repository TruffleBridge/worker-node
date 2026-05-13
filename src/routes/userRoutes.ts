import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { validateRegister, validateLogin, validate } from '../validation/UserValidation.js';

const router = Router();

// REGISTER
router.post('/register', validateRegister(), validate, UserController.register.bind(UserController));

// LOGIN
router.post('/login', validateLogin(), validate, UserController.login.bind(UserController));

export default router;
