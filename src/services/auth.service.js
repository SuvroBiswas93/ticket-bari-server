import userRepository from '../repositories/user.repository.js';

class AuthService {
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId?.toString());
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.update(userId?.toString(), updateData);
    return user;
  }

  async registerVendor(userId) {
    const user = await userRepository.findById(userId?.toString());
    
    if (!user) {
      throw new Error('User not found');
    }


    if(user.role !== 'user') {
      throw new Error('Only users with role "user" can register as vendors');
    }

    const updatedUser = await userRepository.update(userId?.toString(), { role: 'vendor' });
    
    return updatedUser;
  }
}

export default new AuthService();