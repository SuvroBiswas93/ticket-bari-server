import ticketService from '../services/ticket.service.js';

class TicketController {
  async createTicket(req, res) {
    try {
      const ticket = await ticketService.createTicket(req.body, req.user._id);
      
      res.status(201).json({
        status: 'success',
        message: 'Ticket created successfully',
        data: ticket
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getTickets(req, res) {
    try {
      const tickets = await ticketService.getApprovedTickets();
      
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

  async getTicketById(req, res) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id);
      
      res.status(200).json({
        status: 'success',
        data: ticket
      });
    } catch (error) {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getAdvertisedTickets(req, res) {
    try {
      const tickets = await ticketService.getAdvertisedTickets();
      
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

  async getLatestTickets(req, res) {
    try {
      const tickets = await ticketService.getLatestTickets();
      
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

  async getVendorTickets(req, res) {
    try {
      const tickets = await ticketService.getVendorTickets(req.user._id.toString());
      
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

  async updateTicket(req, res) {
    try {
      const ticket = await ticketService.updateTicket(
        req.params.id, 
        req.body, 
        req.user._id.toString()
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Ticket updated successfully',
        data: ticket
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async deleteTicket(req, res) {
    try {
      await ticketService.deleteTicket(req.params.id, req.user._id.toString());
      
      res.status(200).json({
        status: 'success',
        message: 'Ticket deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async searchTickets(req, res) {
    try {
      const result = await ticketService.searchTickets(req.query);
      
      res.status(200).json({
        status: 'success',
        data: result.tickets,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }

  async getPendingTickets(req, res) {
    try {
      const tickets = await ticketService.getPendingTickets();
      
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

  async updateVerificationStatus(req, res) {
    try {
      const { status } = req.body;
      
      const ticket = await ticketService.updateVerificationStatus(
        req.params.id, 
        status
      );
      
      res.status(200).json({
        status: 'success',
        message: `Ticket ${status} successfully`,
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
      const { isAdvertised } = req.body;

      const ticket = await ticketService.toggleAdvertisement(
        req.params.id, 
        isAdvertised
      );
      
      const message = isAdvertised 
        ? 'Ticket advertised successfully' 
        : 'Ticket unadvertised successfully';
      
      res.status(200).json({
        status: 'success',
        message,
        data: ticket
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new TicketController();