import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';
import UserRepository from '../repository/UserRepository.js';
import { sanitizeUser } from '../utils/userResponse.js';

class UserController {
  async register(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, phoneNumber } = req.body;
      const result = await UserService.register({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
      });
      return res.status(201).json({
        status: true,
        message: 'User registered successfully',
        data: { user: result },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return res.status(400).json({ status: false, message });
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return res.status(401).json({ status: false, message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      if (!req.authUser) {
        return res.status(401).json({ status: false, message: 'Unauthorized' });
      }
      const user = await UserRepository.findById(req.authUser.userId);
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
      return res.status(200).json({
        status: true,
        message: 'Profile fetched successfully',
        data: { user: sanitizeUser(user) },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile';
      return res.status(500).json({ status: false, message });
    }
  }
}

export default new UserController();
