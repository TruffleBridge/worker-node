import UserRepository from '../repository/UserRepository.js';
import bcrypt from 'bcrypt';

class UserService {
  async register({ firstName, lastName, email, password, phoneNumber }: {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string
  }) {
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

      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login({ email, password }: { email: string, password: string }) {
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

      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }
}

export default new UserService();
