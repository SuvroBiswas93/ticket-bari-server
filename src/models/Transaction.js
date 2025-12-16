const transactionSchema = {
    userId: {
      type: 'string',
      required: true
    },
    bookingId: {
      type: 'string',
      required: true
    },
    ticketId: {
      type: 'string',
      required: true
    },
    ticketTitle: {
      type: 'string',
      required: true
    },
    amount: {
      type: 'number',
      required: true,
      min: 0
    },
    currency: {
      type: 'string',
      default: 'BDT'
    },
    paymentMethod: {
      type: 'string',
      default: 'stripe'
    },
    transactionId: {
      type: 'string',
      required: true,
      unique: true
    },
    status: {
      type: 'string',
      enum: ['success', 'failed', 'pending'],
      default: 'pending'
    },
    failureReason: {
      type: 'string',
      default: null
    },
    metadata: {
      type: 'object',
      default: {}
    },
    createdAt: {
      type: 'date',
      default: () => new Date()
    }
  };
  
  export default transactionSchema;