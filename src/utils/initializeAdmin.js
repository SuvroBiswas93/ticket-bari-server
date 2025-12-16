import userRepository from '../repositories/user.repository.js';
import { env } from '../config/env.js';

async function initializeAdmin() {
  try {
    const adminEmail = env.adminEmail;
    
    if (!adminEmail) {
      console.warn(' ADMIN_EMAIL not set in environment variables');
      return;
    }

    const existingAdmin = await userRepository.findByEmail(adminEmail);
 
    if (!existingAdmin) {
      await userRepository.create({
        name: 'Super Admin',
        email: adminEmail,
        photoURL: null,
        role: 'admin',
        isActive: true,
        isFraud: false
      });
      
      console.log(' Initial admin user created in database');
      console.log(` Admin email: ${adminEmail}`);
      console.log(' Note: Admin must login via Firebase first to get access');
    } else {
      console.log(' Admin user already exists in database');
      if (existingAdmin.role !== 'admin') {
        await userRepository.update(existingAdmin._id, { role: 'admin' });
        console.log(' Updated existing user to admin role');
      }
    }
  } catch (error) {
    console.error(' Failed to create initial admin:', error.message);
  }
}

export default initializeAdmin;