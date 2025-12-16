import { BaseRepository } from './base.repository.js';
import Booking from '../models/Booking.js';

class BookingRepository extends BaseRepository {
  constructor() {
    super('bookings', Booking);
  }

  async findUserBookings(userId) {
    return await this.find({ userId }, { sort: { createdAt: -1 } });
  }

  async findVendorBookings(vendorId) {
    return await this.find({ vendorId }, { sort: { createdAt: -1 } });
  }

  async findPendingBookings(vendorId = null) {
    const filter = { status: 'pending' };
    if (vendorId) {
      filter.vendorId = vendorId;
    }
    return await this.find(filter, { sort: { createdAt: -1 } });
  }

  async findBookingsByStatus(status, vendorId = null) {
    const filter = { status };
    if (vendorId) {
      filter.vendorId = vendorId;
    }
    return await this.find(filter);
  }

  async findBookingsByTicket(ticketId) {
    return await this.find({ ticketId });
  }

  async updateBookingStatus(bookingId, status) {
    return await this.update(bookingId, { status });
  }

  async updatePaymentStatus(bookingId, paymentStatus, paymentId = null) {
    const updateData = {
      paymentStatus,
      updatedAt: new Date()
    };

    if (paymentId) {
      updateData.paymentId = paymentId;
      updateData.paymentDate = new Date();
    }

    return await this.update(bookingId, updateData);
  }

  async getBookingStatistics(userId = null, vendorId = null) {
    const match = {};
    if (userId) match.userId = userId;
    if (vendorId) match.vendorId = vendorId;

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' }
        }
      }
    ];

    return await this.aggregate(pipeline);
  }

  async getRevenueByVendor(vendorId) {
    const pipeline = [
      { $match: { vendorId, paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: '$bookingQuantity' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ];

    return await this.aggregate(pipeline);
  }

  async getPaidBookingsByVendor(vendorId) {
    return await this.find({ vendorId, paymentStatus: 'paid' });
  }
}

export default new BookingRepository();