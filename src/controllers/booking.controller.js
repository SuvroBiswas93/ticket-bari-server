import bookingService from '../services/booking.service.js';

class BookingController {
  async createBooking(req, res) {
    try {
      const { ticketId, bookingQuantity } = req.body;
      
      const booking = await bookingService.createBooking(
        ticketId, 
        req.user._id, 
        bookingQuantity
      );
      
      res.status(201).json({
        status: 'success',
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getUserBookings(req, res) {
    try {
      const bookings = await bookingService.getUserBookings(req.user._id.toString());
      
      res.status(200).json({
        status: 'success',
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getVendorBookings(req, res) {
    try {
      const bookings = await bookingService.getVendorBookings(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getPendingBookings(req, res) {
    try {
      const bookings = await bookingService.getPendingBookings(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const { status } = req.body;

      const booking = await bookingService.updateBookingStatus(
        req.params.id, 
        status, 
        req.user._id
      );
      
      const message = status === 'accepted' 
        ? 'Booking accepted successfully' 
        : 'Booking rejected successfully';
      
      res.status(200).json({
        status: 'success',
        message,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async processPayment(req, res) {
    try {
      const { paymentId } = req.body;

      const booking = await bookingService.processPayment(
        req.params.id, 
        paymentId, 
        req.user._id
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Payment processed successfully',
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async cancelBooking(req, res) {
    try {
      await bookingService.cancelBooking(req.params.id, req.user._id);
      
      res.status(200).json({
        status: 'success',
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getBookingStatistics(req, res) {
    try {
      let statistics;
      
      if (req.user.role === 'user') {
        statistics = await bookingService.getBookingStatistics(req.user._id);
      } else if (req.user.role === 'vendor') {
        statistics = await bookingService.getBookingStatistics(null, req.user._id);
      } else {
        statistics = await bookingService.getBookingStatistics();
      }
      
      res.status(200).json({
        status: 'success',
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new BookingController();