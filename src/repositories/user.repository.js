import { BaseRepository } from './base.repository.js';
import User from '../models/User.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('users', User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findByEmails(emails) {
    return await this.find({ email: { $in: emails } });
  }

  async findActiveUsers() {
    return await this.find({ isActive: true });
  }

  async findUsersByRole(role) {
    return await this.find({ role, isActive: true });
  }

  async updateUserRole(userId, role) {
    return await this.update(userId, { role });
  }

  async markAsFraud(userId) {
    return await this.update(userId, { 
      isFraud: true,
      isActive: false 
    });
  }
}

export default new UserRepository();