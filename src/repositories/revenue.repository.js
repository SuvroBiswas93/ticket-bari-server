import { BaseRepository } from './base.repository.js';
import Revenue from '../models/Revenue.js';

class RevenueRepository extends BaseRepository {
  constructor() {
    super('revenues', Revenue);
  }

  async findVendorRevenue(vendorId, year = null, month = null) {
    const filter = { vendorId };
    if (year) filter.year = year;
    if (month) filter.month = month;
    
    return await this.find(filter, { sort: { year: -1, month: -1 } });
  }

  async updateVendorRevenue(vendorId, year, month, data) {
    const filter = { vendorId, year, month };
    const existing = await this.findOne(filter);
    
    if (existing) {
      return await this.update(existing._id, {
        ...data,
        updatedAt: new Date()
      });
    } else {
      return await this.create({
        vendorId,
        year,
        month,
        ...data
      });
    }
  }

  async incrementRevenue(vendorId, year, month, amount, ticketsSold = 0) {
    const filter = { vendorId, year, month };
    const existing = await this.findOne(filter);
    
    if (existing) {
      return await this.update(existing._id, {
        totalRevenue: existing.totalRevenue + amount,
        totalTicketsSold: existing.totalTicketsSold + ticketsSold,
        updatedAt: new Date()
      });
    } else {
      return await this.create({
        vendorId,
        year,
        month,
        totalRevenue: amount,
        totalTicketsSold: ticketsSold,
        totalTicketsAdded: 0
      });
    }
  }

  async incrementTicketsAdded(vendorId, year, month, count = 1) {
    const filter = { vendorId, year, month };
    const existing = await this.findOne(filter);
    
    if (existing) {
      return await this.update(existing._id, {
        totalTicketsAdded: existing.totalTicketsAdded + count,
        updatedAt: new Date()
      });
    } else {
      return await this.create({
        vendorId,
        year,
        month,
        totalRevenue: 0,
        totalTicketsSold: 0,
        totalTicketsAdded: count
      });
    }
  }

  async getTotalRevenueByVendor(vendorId) {
    const pipeline = [
      { $match: { vendorId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalTicketsSold: { $sum: '$totalTicketsSold' },
          totalTicketsAdded: { $sum: '$totalTicketsAdded' }
        }
      }
    ];

    const result = await this.aggregate(pipeline);
    return result[0] || { totalRevenue: 0, totalTicketsSold: 0, totalTicketsAdded: 0 };
  }
}

export default new RevenueRepository();