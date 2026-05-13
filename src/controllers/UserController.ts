import type { Request, Response } from 'express';
import UserService from '../services/UserService.js';

class UserController {
  async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, password, phonenumber } = req.body;
      const result = await UserService.register(firstname, lastname, email, password, phonenumber);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new UserController();
