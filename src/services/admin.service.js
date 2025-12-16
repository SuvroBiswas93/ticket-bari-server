import userRepository from '../repositories/user.repository.js';
import ticketRepository from '../repositories/ticket.repository.js';
import bookingRepository from '../repositories/booking.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';

class AdminService {
  async getAllUsers() {
    const users = await userRepository.find({}, { 
      projection: { password: 0 } 
    });
    return users;
  }

  async updateUserRole(userId, role) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return await userRepository.updateUserRole(userId, role);
  }

  async markVendorAsFraud(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'vendor') {
      throw new Error('Only vendors can be marked as fraud');
    }

    const updatedUser = await userRepository.markAsFraud(userId);

    await ticketRepository.updateMany(
      { vendorId: userId.toString() },
      { isActive: false }
    );

    return updatedUser;
  }

  async getAllTickets() {
    return await ticketRepository.find({});
  }

  async updateVerificationStatus(ticketId, status) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new Error('Invalid verification status');
    }
    return await ticketRepository.update(ticketId, { verificationStatus: status });
  }

  async toggleAdvertisement(ticketId, isAdvertised) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    if (typeof isAdvertised !== 'boolean') {
      throw new Error('isAdvertised must be a boolean');
    }
    if (isAdvertised) {
      const count = await ticketRepository.count({
        isAdvertised: true,
        verificationStatus: 'approved',
        _id: { $ne: ticketId }
      });
      if (count >= 6) {
        throw new Error('Maximum 6 tickets can be advertised at a time');
      }
    }
    return await ticketRepository.update(ticketId, { isAdvertised });
  }

  async getDashboardStats() {
    const [
      userStats,
      ticketStats,
      bookingStats,
      recentTransactions
    ] = await Promise.all([
      userRepository.getStatistics(),
      ticketRepository.getTicketStatistics(),
      bookingRepository.getBookingStatistics(),
      transactionRepository.getRecentTransactions(10)
    ]);

    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalTickets = ticketStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalBookings = bookingStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = bookingStats
      .filter(stat => stat._id === 'paid')
      .reduce((sum, stat) => sum + (stat.totalAmount || 0), 0);

    return {
      overview: {
        totalUsers,
        totalTickets,
        totalBookings,
        totalRevenue
      },
      userStats: userStats.reduce((obj, stat) => ({
        ...obj,
        [stat._id]: stat.count
      }), {}),
      ticketStats: ticketStats.reduce((obj, stat) => ({
        ...obj,
        [stat._id]: stat.count
      }), {}),
      bookingStats: bookingStats.reduce((obj, stat) => ({
        ...obj,
        [stat._id]: stat.count
      }), {}),
      recentTransactions
    };
  }

  async getRevenueAnalytics(timeframe = 'monthly') {
    const pipeline = [];
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    pipeline.push({
      $match: {
        paymentDate: { $gte: startDate },
        paymentStatus: 'paid'
      }
    });

    let groupBy;
    switch (timeframe) {
      case 'weekly':
        groupBy = { $dayOfWeek: '$paymentDate' };
        break;
      case 'monthly':
        groupBy = { $dayOfMonth: '$paymentDate' };
        break;
      case 'yearly':
        groupBy = { $month: '$paymentDate' };
        break;
      default:
        groupBy = { $dayOfMonth: '$paymentDate' };
    }

    pipeline.push({
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: '$totalPrice' },
        totalBookings: { $sum: 1 }
      }
    });

    pipeline.push({ $sort: { _id: 1 } });

    const analytics = await bookingRepository.aggregate(pipeline);

    return {
      timeframe,
      analytics
    };
  }
}

export default new AdminService();