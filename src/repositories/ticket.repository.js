import { BaseRepository } from './base.repository.js';
import Ticket from '../models/Ticket.js';

class TicketRepository extends BaseRepository {
  constructor() {
    super('tickets', Ticket);
  }

  async findApprovedTickets() {
    return await this.find({ 
      verificationStatus: 'approved',
      isActive: true 
    });
  }

  async findAdvertisedTickets(limit = 6) {
    return await this.find(
      { 
        verificationStatus: 'approved',
        isAdvertised: true,
      },
      { 
        limit,
        sort: { createdAt: -1 } 
      }
    );
  }

  async findLatestTickets(limit = 8) {
    return await this.find(
      { 
        verificationStatus: 'approved',
      },
      { 
        limit,
        sort: { createdAt: -1 } 
      }
    );
  }

  async findTicketsByVendor(vendorId) {
    return await this.find({ vendorId });
  }

  async findPendingTickets() {
    return await this.find({ verificationStatus: 'pending' });
  }

  async searchTickets(searchTerm, filters = {}) {
    const query = {
      verificationStatus: 'approved',
    };


    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { from: { $regex: searchTerm, $options: 'i' } },
        { to: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (filters.transportType) {
      query.transportType = filters.transportType;
    }

    if (filters.from) {
      query.from = { $regex: filters.from, $options: 'i' };
    }

    if (filters.to) {
      query.to = { $regex: filters.to, $options: 'i' };
    }


    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    
    const dateConditions = [
      { departureTime: { $gte: now } }, 
      { departureTime: { $gte: todayString } } 
    ];

    if (searchTerm) {
      query.$and = [
        { $or: query.$or },
        { $or: dateConditions }
      ];
      delete query.$or;
    } else {
      query.$or = dateConditions;
    }

    return query;
  }

  async getAdvertisedCount() {
    return await this.count({ 
      isAdvertised: true,
      verificationStatus: 'approved' 
    });
  }

  async reduceAvailableQuantity(ticketId, quantity) {
    const collection = this.getCollection();
    return await collection.findOneAndUpdate(
      { _id: ticketId },
      { 
        $inc: { availableQuantity: -quantity },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  async increaseAvailableQuantity(ticketId, quantity) {
    const collection = this.getCollection();
    return await collection.findOneAndUpdate(
      { _id: ticketId },
      { 
        $inc: { availableQuantity: quantity },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
  }

  async getTicketStatistics() {
    const pipeline = [
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ['$price', '$totalQuantity'] } }
        }
      }
    ];

    return await this.aggregate(pipeline);
  }
}

export default new TicketRepository();