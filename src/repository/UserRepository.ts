import User from '../models/User.js';
import type { AuthProvider } from '../types/auth.js';

class UserRepository {
  async create(userData: Record<string, unknown>) {
    return await User.create(userData);
  }

  async findById(id: number) {
    return await User.findByPk(id);
  }

  async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }

  async findByProvider(authProvider: AuthProvider, providerId: string) {
    return await User.findOne({ where: { authProvider, providerId } });
  }

  async findByProviderId(providerId: string) {
    return await User.findOne({ where: { providerId } });
  }

  async update(id: number, data: Record<string, unknown>) {
    await User.update(data, { where: { id } });
    return await this.findById(id);
  }
}

export default new UserRepository();
