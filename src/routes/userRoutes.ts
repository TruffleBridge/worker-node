import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { validateLogin, validate } from '../validation/UserValidation.js';

const router = Router();

// LOGIN
router.post('/login', validateLogin(), validate, UserController.login.bind(UserController));

export default router;
