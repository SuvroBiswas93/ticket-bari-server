const ticketSchema = {
    title: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 200
    },
    from: {
      type: 'string',
      required: true
    },
    to: {
      type: 'string',
      required: true
    },
    transportType: {
      type: 'string',
      required: true
    },
    price: {
      type: 'number',
      required: true,
      min: 0
    },
    totalQuantity: {
      type: 'number',
      required: true,
      min: 0
    },
    availableQuantity: {
      type: 'number',
      required: true,
      min: 0
    },
    departureDate: {
      type: 'date',
      required: true
    },
    departureTime: {
      type: 'string',
      required: true
    },
    perks: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    image: {
      type: 'string',
      required: true
    },
    vendorId: {
      type: 'string', 
      required: true
    },
    vendorName: {
      type: 'string',
      required: true
    },
    vendorEmail: {
      type: 'string',
      required: true
    },
    verificationStatus: {
      type: 'string',
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isAdvertised: {
      type: 'boolean',
      default: false
    },
    isActive: {
      type: 'boolean',
      default: true
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
  
  export default ticketSchema;