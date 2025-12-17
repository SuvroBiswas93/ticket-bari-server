import bookingRepository from '../repositories/booking.repository.js';
import ticketRepository from '../repositories/ticket.repository.js';
import userRepository from '../repositories/user.repository.js';
import moment from 'moment';
import transactionRepository from '../repositories/transaction.repository.js';

class BookingService {
  async createBooking(ticketId, userId, bookingQuantity) {
    const ticket = await ticketRepository.findById(ticketId?.toString());
    if (!ticket || !ticket.isActive) {
      throw new Error('Ticket not found');
    }

    if (ticket.verificationStatus !== 'approved') {
      throw new Error('Ticket is not approved for booking');
    }

    const departureDateTime = moment(ticket.departureTime);
    if (departureDateTime.isBefore(moment())) {
      throw new Error('Cannot book past departure');
    }

    if (ticket.availableQuantity < bookingQuantity) {
      throw new Error('Not enough tickets available');
    }

    const user = await userRepository.findById(userId?.toString());
    if (!user || !user.isActive) {
      throw new Error('User not found');
    }

    const totalPrice = ticket.price * bookingQuantity;

    const booking = await bookingRepository.create({
      ticketId: ticketId?.toString(),
      userId: userId?.toString(),
      userName: user.name,
      userEmail: user.email,
      bookingQuantity,
      totalPrice,
      departureTime: ticket.departureTime,
      vendorId: ticket.vendorId?.toString(),
      ticketTitle: ticket.title,
      ticketPrice: ticket.price,
      transportType: ticket.transportType,
      from: ticket.from,
      to: ticket.to
    });

    await ticketRepository.reduceAvailableQuantity(ticketId?.toString(), bookingQuantity);

    return booking;
  }

  async getUserBookings(userId) {
    const bookings = await bookingRepository.findUserBookings(userId?.toString());

    const bookingsWithCountdown = bookings.map(booking => {
      const departureDateTime = moment(booking.departureTime);
      const now = moment();
      const diff = departureDateTime.diff(now);
      
      return {
        ...booking,
        countdown: diff > 0 ? diff : 0
      };
    });

    return bookingsWithCountdown;
  }

  async getVendorBookings(vendorId) {
    return await bookingRepository.findVendorBookings(vendorId?.toString());
  }

  async getPendingBookings(vendorId = null) {
    return await bookingRepository.findPendingBookings(vendorId?.toString());
  }

  async updateBookingStatus(bookingId, status, vendorId = null) {
    const booking = await bookingRepository.findById(bookingId?.toString());
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (vendorId && booking.vendorId !== vendorId?.toString()) {
      throw new Error('Not authorized to update this booking');
    }


    if (booking.status !== 'pending') {
      throw new Error('Booking status cannot be changed');
    }

    if (status === 'rejected') {
      await ticketRepository.increaseAvailableQuantity(
        booking.ticketId?.toString(), 
        booking.bookingQuantity
      );
    }

    return await bookingRepository.updateBookingStatus(bookingId?.toString(), status);
  }
  async cancelBooking(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId?.toString());
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId?.toString()) {
      throw new Error('Not authorized to cancel this booking');
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be cancelled');
    }

    await ticketRepository.increaseAvailableQuantity(
      booking.ticketId?.toString(), 
      booking.bookingQuantity
    );

    await bookingRepository.delete(bookingId?.toString());

    return true;
  }

  async getBookingStatistics(userId = null, vendorId = null) {
    return await bookingRepository.getBookingStatistics(userId?.toString(), vendorId?.toString());
  }

  async getRevenueByVendor(vendorId) {
    // Get paid bookings to calculate totals
    const paidBookings = await bookingRepository.getPaidBookingsByVendor(vendorId?.toString());
    
    // Calculate totals
    const totalRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const totalTicketsSold = paidBookings.reduce((sum, booking) => sum + (booking.bookingQuantity || 0), 0);
    
    // Get total tickets added by vendor
    const vendorTickets = await ticketRepository.findTicketsByVendor(vendorId?.toString());
    const totalTicketsAdded = vendorTickets.length;
    
    // Get revenue data grouped by ticket
    const ticketsRevenueData = await bookingRepository.getRevenueByTicket(vendorId?.toString());
    
    // Transform data to match frontend format
    const ticketsData = ticketsRevenueData.map(item => ({
      title: item.ticketTitle || 'Unknown Ticket',
      sold: item.sold || 0,
      revenue: item.revenue || 0
    }));
    
    return {
      totalRevenue,
      totalTicketsSold,
      totalTicketsAdded,
      ticketsData
    };
  }
}

export default new BookingService();