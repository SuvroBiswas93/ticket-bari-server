import Joi from 'joi';

function schemaToJoi(customSchema, options = {}) {
  const { partial = false } = options;
  const joiObj = {};
  for (const [key, value] of Object.entries(customSchema)) {
    let joiField;
    switch (value.type) {
      case 'string':
        joiField = Joi.string();
        if (value.minLength) joiField = joiField.min(value.minLength);
        if (value.maxLength) joiField = joiField.max(value.maxLength);
        if (value.match) joiField = joiField.pattern(value.match);
        if (value.enum) joiField = joiField.valid(...value.enum);
        if (!value.required || partial) {
          joiField = joiField.allow('', null);
        }
        break;
      case 'number':
        joiField = Joi.number();
        if (value.min !== undefined) joiField = joiField.min(value.min);
        if (value.max !== undefined) joiField = joiField.max(value.max);
        break;
      case 'boolean':
        joiField = Joi.boolean();
        break;
      case 'date':
        joiField = Joi.date();
        break;
      case 'array':
        joiField = Joi.array();
        if (value.items && value.items.type === 'string') joiField = joiField.items(Joi.string());
        break;
      default:
        joiField = Joi.any();
    }
    
    // Handle default values (static or function)
    if (value.default !== undefined) {
      if (typeof value.default === 'function') {
        joiField = joiField.default(value.default);
      } else {
        joiField = joiField.default(value.default);
      }
    }
    
    if (!partial && value.required) {
      joiField = joiField.required();
    }
    joiObj[key] = joiField;
  }
  return Joi.object(joiObj);
}

export default schemaToJoi;
