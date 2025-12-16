import userRepository from '../repositories/user.repository.js';
import { verifyIdToken } from '../config/firebase.js';

class AuthService {
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.update(userId, updateData);
    return user;
  }

  async registerVendor(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await userRepository.update(userId, { role: 'vendor' });
    
    return updatedUser;
  }
}

export default new AuthService();