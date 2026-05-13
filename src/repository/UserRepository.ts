import User from '../models/User.js';

class UserRepository {
  async create(userData: any) {
    return await User.create(userData);
  }

  async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }
}

export default new UserRepository();
