import ticketRepository from '../repositories/ticket.repository.js';
import userRepository from '../repositories/user.repository.js';

class TicketService {
  async createTicket(ticketData, vendorId) {
    const vendor = await userRepository.findById(vendorId);
    if (!vendor || !vendor.isActive || vendor.isFraud) {
      throw new Error('Vendor not authorized to add tickets');
    }

    const ticket = await ticketRepository.create({
      ...ticketData,
      vendorId: vendorId.toString(),
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      availableQuantity: ticketData.totalQuantity
    });

    return ticket;
  }

  async getTicketById(ticketId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    return ticket;
  }

  async getApprovedTickets() {
    return await ticketRepository.findApprovedTickets();
  }

  async getAdvertisedTickets() {
    return await ticketRepository.findAdvertisedTickets();
  }

  async getLatestTickets() {
    return await ticketRepository.findLatestTickets();
  }

  async getVendorTickets(vendorId) {
    return await ticketRepository.findTicketsByVendor(vendorId);
  }

  async updateTicket(ticketId, updateData, vendorId = null) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (vendorId && ticket.vendorId !== vendorId.toString()) {
      throw new Error('Not authorized to update this ticket');
    }

    if (updateData.totalQuantity !== undefined) {
      const quantityDifference = updateData.totalQuantity - ticket.totalQuantity;
      updateData.availableQuantity = ticket.availableQuantity + quantityDifference;
      
      if (updateData.availableQuantity < 0) {
        throw new Error('Available quantity cannot be negative');
      }
    }

    return await ticketRepository.update(ticketId, updateData);
  }

  async deleteTicket(ticketId, vendorId) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.vendorId !== vendorId.toString()) {
      throw new Error('Not authorized to delete this ticket');
    }

    const bookingRepository = (await import('./booking.service.js')).default;
    const bookings = await bookingRepository.findBookingsByTicket(ticketId);
    
    if (bookings.length > 0) {
      throw new Error('Cannot delete ticket with existing bookings');
    }

    await ticketRepository.update(ticketId, { isActive: false });

    return true;
  }

  async searchTickets(searchParams) {
    const {
      search,
      from,
      to,
      transportType,
      sortBy = 'departure_asc',
      page = 1,
      limit = 9
    } = searchParams;

    const filter = await ticketRepository.searchTickets(search, {
      transportType,
      from,
      to
    });

    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'departure_desc':
        sort = { departureTime: -1 };
        break;
      default:
        sort = { departureTime: 1 };
    }

    const skip = (page - 1) * limit;
    const total = await ticketRepository.count(filter);
    const tickets = await ticketRepository.find(filter, {
      skip,
      limit: parseInt(limit),
      sort
    });

    return {
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getPendingTickets() {
    return await ticketRepository.findPendingTickets();
  }

  async updateVerificationStatus(ticketId, status) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return await ticketRepository.update(ticketId, { verificationStatus: status });
  }

  async toggleAdvertisement(ticketId, isAdvertised) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.verificationStatus !== 'approved') {
      throw new Error('Only approved tickets can be advertised');
    }

    if (isAdvertised && ticket.isAdvertised) {
      return ticket;
    }
  
    if (isAdvertised) {
      const advertisedCount = await ticketRepository.getAdvertisedCount();
      if (advertisedCount >= 6) {
        throw new Error('Cannot advertise more than 6 tickets');
      }
    }

    return await ticketRepository.update(ticketId, { isAdvertised });
  }

  async reduceTicketQuantity(ticketId, quantity) {
    const result = await ticketRepository.reduceAvailableQuantity(ticketId, quantity);
    if (!result) {
      throw new Error('Failed to reduce ticket quantity');
    }
    return result;
  }

  async increaseTicketQuantity(ticketId, quantity) {
    const result = await ticketRepository.increaseAvailableQuantity(ticketId, quantity);
    if (!result) {
      throw new Error('Failed to increase ticket quantity');
    }
    return result;
  }

  async getTicketStatistics() {
    return await ticketRepository.getTicketStatistics();
  }
}

export default new TicketService();