import paymentService from '../services/payment.service.js';

class PaymentController {
  async createCheckoutSession(req, res) {
    try {
      const result = await paymentService.createCheckoutSession(
        req.body.bookingId, 
        req.user._id
      );
      
      res.status(200).json({
        status: 'success',
        data: {
          url: result.url
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
  async getUserTransactions(req, res) {
    try {
      const transactions = await paymentService.getUserTransactions(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: transactions
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getTransactionById(req, res) {
    try {
      const transaction = await paymentService.getTransactionById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({
          status: 'error',
          message: 'Transaction not found'
        });
      }
      
      if (transaction.userId !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to view this transaction'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
  async handleWebhook(req, res) {
    try {
      const result = await paymentService.handleWebhook(req);
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async handleCheckoutSessionCompleted(req, res) {
    try {
      const sessionId = req.body.sessionId;

      const booking = await paymentService.handleApiCheckoutSessionCompleted(sessionId);
      
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
}

export default new PaymentController();