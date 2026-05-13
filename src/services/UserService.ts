import UserRepository from '../repository/UserRepository.js';
import bcrypt from 'bcrypt';

class UserService {
  async register(firstName: string, lastName: string, email: string, password: string, phoneNumber: string) {
    try {
      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await UserRepository.create({
        firstName,
        lastName,
        email,
        phone: phoneNumber,
        password: hashedPassword,
      });

      // Remove password from response
      const userData = newUser.toJSON();
      delete userData.password;

      return {
        user: userData,
        message: 'User registered successfully',
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error}`);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare passwords - assuming password is hashed in DB
      const isPasswordValid = await bcrypt.compare(password, user.getDataValue('password'));
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Remove password from response
      const userData = user.toJSON();
      delete userData.password;

      return {
        user: userData,
        // Add token generation here if needed (JWT)
      };
    } catch (error) {
      throw new Error(`Login failed: ${error}`);
    }
  }
}

export default new UserService();
