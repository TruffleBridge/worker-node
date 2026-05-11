import UserRepository from '../repository/UserRepository.js';
import bcrypt from 'bcrypt';

class UserService {
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
