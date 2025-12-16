const bookingSchema = {
    ticketId: {
      type: 'string', // ObjectId as string
      required: true
    },
    userId: {
      type: 'string', // ObjectId as string
      required: true
    },
    userName: {
      type: 'string',
      required: true
    },
    userEmail: {
      type: 'string',
      required: true
    },
    bookingQuantity: {
      type: 'number',
      required: true,
      min: 1
    },
    totalPrice: {
      type: 'number',
      required: true,
      min: 0
    },
    status: {
      type: 'string',
      enum: ['pending', 'accepted', 'rejected', 'paid'],
      default: 'pending'
    },
    paymentStatus: {
      type: 'string',
      enum: ['pending', 'paid'],
      default: 'pending'
    },
    departureDate: {
      type: 'date',
      required: true
    },
    departureTime: {
      type: 'string',
      required: true
    },
    paymentId: {
      type: 'string',
      default: null
    },
    paymentDate: {
      type: 'date',
      default: null
    },
    vendorId: {
      type: 'string',
      required: true
    },
    ticketTitle: {
      type: 'string',
      required: true
    },
    ticketPrice: {
      type: 'number',
      required: true
    },
    transportType: {
      type: 'string',
      required: true
    },
    from: {
      type: 'string',
      required: true
    },
    to: {
      type: 'string',
      required: true
    },
    createdAt: {
      type: 'date',
      default: () => new Date()
    },
    updatedAt: {
      type: 'date',
      default: () => new Date()
    }
  };
  
  export default bookingSchema;