const userSchema = {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    photoURL: {
      type: 'string',
      default: '',
      required: false
    },
    role: {
      type: 'string',
      enum: ['user', 'vendor', 'admin'],
      default: 'user'
    },
    isActive: {
      type: 'boolean',
      default: true
    },
    isFraud: {
      type: 'boolean',
      default: false
    },
    firebaseUid: {
      type: 'string',
      default: null
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
  
  export default userSchema;