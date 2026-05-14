import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';

class UserController {
  async register(req: Request, res: Response) {
    try {
      // Expect camelCase body params
      const { firstName, lastName, email, password, phoneNumber } = req.body;
      const result = await UserService.register({ firstName, lastName, email, password, phoneNumber });
      return res.status(201).json({
        status: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        status: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login({ email, password });
      return res.status(200).json({
        status: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        status: false,
        message: error.message || 'Login failed',
      });
    }
  }
}

export default new UserController();
