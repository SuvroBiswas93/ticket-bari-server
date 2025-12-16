import { BaseRepository } from './base.repository.js';
import Transaction from '../models/Transaction.js';

class TransactionRepository extends BaseRepository {
  constructor() {
    super('transactions', Transaction);
  }

  async findUserTransactions(userId, limit = 50) {
    return await this.find(
      { userId },
      { 
        limit,
        sort: { createdAt: -1 } 
      }
    );
  }

  async findTransactionsByBooking(bookingId) {
    return await this.find({ bookingId });
  }

  async findTransactionByStripeId(transactionId) {
    return await this.findOne({ transactionId });
  }

  async getRecentTransactions(limit = 10) {
    return await this.find(
      {},
      {
        limit,
        sort: { createdAt: -1 }
      }
    );
  }

  async getTransactionStatistics() {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ];

    return await this.aggregate(pipeline);
  }

  async getTransactionsByDateRange(startDate, endDate) {
    return await this.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
  }
}

export default new TransactionRepository();