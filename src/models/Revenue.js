const revenueSchema = {
    vendorId: {
      type: 'string',
      required: true
    },
    totalRevenue: {
      type: 'number',
      default: 0
    },
    totalTicketsSold: {
      type: 'number',
      default: 0
    },
    totalTicketsAdded: {
      type: 'number',
      default: 0
    },
    month: {
      type: 'number',
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: 'number',
      required: true,
      min: 2020
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
  
  export default revenueSchema;