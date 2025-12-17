import adminService from '../services/admin.service.js';

class AdminController {
  async getAllUsers(req, res) {
    try {
      const users = await adminService.getAllUsers();
      
      res.status(200).json({
        status: 'success',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

    async updateVerificationStatus(req, res) {
      try {
        const ticket = await adminService.updateVerificationStatus(req.params.id, req.body.status);
        res.status(200).json({
          status: 'success',
          message: `Ticket verification status updated to ${req.body.status}`,
          data: ticket
        });
      } catch (error) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
    }

    async toggleAdvertisement(req, res) {
      try {
        const ticket = await adminService.toggleAdvertisement(req.params.id, req.body.isAdvertised);
        res.status(200).json({
          status: 'success',
          message: `Ticket advertisement status updated to ${req.body.isAdvertised}`,
          data: ticket
        });
      } catch (error) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
    }

  async updateUserRole(req, res) {
    try {
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot change your own role'
        });
      }

      const user = await adminService.updateUserRole(req.params.id, req.body.role);
      
      res.status(200).json({
        status: 'success',
        message: `User role updated to ${req.body.role}`,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async toggleVendorFraudStatus(req, res) {
    try {
      const user = await adminService.toggleVendorFraudStatus(req.params.id, req.body.isFraud);
      
      const message = req.body.isFraud 
        ? 'Vendor marked as fraud successfully' 
        : 'Vendor fraud status removed successfully';
      
      res.status(200).json({
        status: 'success',
        message,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getAllTickets(req, res) {
    try {
      const tickets = await adminService.getAllTickets();
      
      res.status(200).json({
        status: 'success',
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getRevenueAnalytics(req, res) {
    try {
      const analytics = await adminService.getRevenueAnalytics(req.query.timeframe);
      
      res.status(200).json({
        status: 'success',
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new AdminController();