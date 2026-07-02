const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  uploadDir: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || './uploads'),
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 10,
  fabricNetworkPath: path.resolve(__dirname, '../../', process.env.FABRIC_NETWORK_PATH || '../fabric-samples/test-network'),
  fabricDiscovery: process.env.FABRIC_DISCOVERY !== 'false',
};
