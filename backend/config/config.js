require('dotenv/config');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

/**
 * Fetches a secret from Google Cloud Secret Manager
 * @param {string} name - Full secret path
 * @returns {Promise<string>} - Secret value
 */
async function fetchSecret(name) {
  try {
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString('utf8');
  } catch (err) {
    console.error(`❌ Failed to access secret: ${name}`, err);
    throw new Error(`Secret access failed: ${err.message}`);
  }
}

/**
 * Loads runtime configuration, validating required keys.
 * @returns {Promise<Object>} - Config object
 */
async function loadConfig() {
  const projectId = process.env.GCP_PROJECT_ID || 'immigrationai';

  const config = {
    mongoURI: process.env.MONGO_URI || await fetchSecret(`projects/${projectId}/secrets/MONGO_URI/versions/latest`),
    jwtSecret: process.env.JWT_SECRET || await fetchSecret(`projects/${projectId}/secrets/JWT_SECRET/versions/latest`),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || await fetchSecret(`projects/${projectId}/secrets/STRIPE_SECRET_KEY/versions/latest`),
    paypalClientId: process.env.PAYPAL_CLIENT_ID || await fetchSecret(`projects/${projectId}/secrets/PAYPAL_CLIENT_ID/versions/latest`),
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || await fetchSecret(`projects/${projectId}/secrets/PAYPAL_CLIENT_SECRET/versions/latest`),
    sendgridKey: process.env.SENDGRID_KEY || await fetchSecret(`projects/${projectId}/secrets/SENDGRID_KEY/versions/latest`),
    googleVisionKeyJSON: process.env.GOOGLE_VISION_KEY_JSON || await fetchSecret(`projects/${projectId}/secrets/GOOGLE_VISION_KEY_JSON/versions/latest`),
    openaiKey: process.env.OPENAI_API_KEY || await fetchSecret(`projects/${projectId}/secrets/OPENAI_API_KEY/versions/latest`),
    frontendBaseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    geoIPProviderKey: process.env.GEO_IP_KEY || '',
    enableBaraza: process.env.ENABLE_BARAZA === 'true',
    enableCLA: process.env.ENABLE_CLA === 'true',
    enableBiasMonitor: process.env.ENABLE_BIAS_MONITOR === 'true',
    enableDriftMonitor: process.env.ENABLE_DRIFT_MONITOR === 'true',
    enableHallucinationMitigator: process.env.ENABLE_HALLUCINATION_MITIGATOR === 'true',
  };

  const requiredKeys = [
    'mongoURI',
    'jwtSecret',
    'stripeSecretKey',
    'paypalClientId',
    'paypalClientSecret',
    'sendgridKey',
    'googleVisionKeyJSON',
    'openaiKey'
  ];

  for (const key of requiredKeys) {
    if (!config[key]) {
      console.error(`❌ Missing required config: ${key}`);
      throw new Error(`Config validation failed: ${key} is not set`);
    }
  }

  console.log('✅ Configuration loaded and validated.');
  return config;
}

module.exports = loadConfig;
