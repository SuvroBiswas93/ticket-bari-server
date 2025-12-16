export const validate = (schema) => {
    return (req, res, next) => {
      let dataToValidate = {};
      
      // Combine body, query, and params
      if (req.body && Object.keys(req.body).length > 0) {
        dataToValidate = { ...dataToValidate, ...req.body };
      }
      
      if (req.query && Object.keys(req.query).length > 0) {
        dataToValidate = { ...dataToValidate, ...req.query };
      }
      
      if (req.params && Object.keys(req.params).length > 0) {
        dataToValidate = { ...dataToValidate, ...req.params };
      }
  
      const { error, value } = schema.validate(dataToValidate, { 
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });
  
      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errorMessages
        });
      }
  
      // Replace validated data (only validated fields, extra fields are stripped)
      req.body = value.body || req.body;
      req.query = value.query || req.query;
      req.params = value.params || req.params;
      
      next();
    };
  };