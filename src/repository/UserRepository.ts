import User from '../models/User.js';

class UserRepository {
  async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }
}

export default new UserRepository();
