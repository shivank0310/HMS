const mongoose = require('mongoose');
const logger = require('./logger');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medichain_hms';

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI);
  logger.info(`MongoDB connected: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

module.exports = { connectDatabase, disconnectDatabase, mongoose };
