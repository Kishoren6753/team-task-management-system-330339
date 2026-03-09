'use strict';

class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function isHttpError(err) {
  return Boolean(err && typeof err.statusCode === 'number');
}

module.exports = {
  HttpError,
  isHttpError,
};
