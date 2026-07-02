const ApiError = require('../utils/ApiError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return next(new ApiError('Validation failed', 422, error.details.map((d) => d.message)));
    }

    req[source] = value;
    return next();
  };
}

module.exports = validate;
