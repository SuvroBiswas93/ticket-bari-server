import Joi from 'joi';
import authService from '../services/auth.service.js';

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  photoURL: Joi.string().uri().allow('')
});

class AuthController {
  async getProfile(req, res) {
    try {
      const user = await authService.getCurrentUser(req.user._id.toString());
      
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL || '',
        role: user.role,
        isActive: user.isActive,
        isFraud: user.isFraud || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.status(200).json({
        status: 'success',
        data: userResponse
      });
    } catch (error) {
      res.status(error.message === 'User not found' ? 404 : 400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateProfile(req, res) {
    try {
      // Validate request body
      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: error.details[0].message
        });
      }

      const user = await authService.updateProfile(req.user._id.toString(), value);
      
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL || '',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: userResponse
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async registerVendor(req, res) {
    try {
      const user = await authService.registerVendor(req.user._id.toString());
      
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL || '',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      res.status(200).json({
        status: 'success',
        message: 'Registered as vendor successfully',
        data: userResponse
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new AuthController();