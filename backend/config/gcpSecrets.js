const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

// Singleton GCP Secret Manager client
const client = new SecretManagerServiceClient();

/**
 * Validates the name of the secret being requested
 * @param {string} name - Secret key (e.g., 'OPENAI_API_KEY')
 * @throws {Error} if name is missing or invalid
 */
function validateSecretName(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('[gcpSecrets] Invalid secret name provided.');
  }
}

/**
 * Fetches a secret's value from GCP Secret Manager
 * @param {string} name - The key of the secret
 * @returns {Promise<string>} - The resolved secret value
 */
async function getSecret(name) {
  try {
    validateSecretName(name);

    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
      throw new Error('[gcpSecrets] GCP_PROJECT_ID is not set.');
    }

    const fullSecretName = `projects/${projectId}/secrets/${name}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name: fullSecretName });
    const value = version?.payload?.data?.toString('utf8');

    if (!value) {
      throw new Error(`[gcpSecrets] Secret ${name} is empty or unreadable.`);
    }

    return value;
  } catch (err) {
    console.error(`[gcpSecrets] Failed to load "${name}" →`, err.message);
    throw err;
  }
}

/**
 * Preloads common runtime secrets into process.env
 * Will not overwrite existing environment variables
 */
async function preloadCommonSecrets() {
  const keys = [
    'JWT_SECRET',
    'MONGO_URI',
    'VISION_API_KEY',
    'OPENAI_API_KEY',
    'SENDGRID_KEY',
    'STRIPE_SECRET_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET'
  ];

  for (const key of keys) {
    try {
      if (!process.env[key]) {
        process.env[key] = await getSecret(key);
        console.log(key, process.env[key])
      }
    } catch (err) {
      console.warn(`[gcpSecrets] Skipped ${key}:`, err.message);
    }
  }
}

module.exports = {
  getSecret,
  preloadCommonSecrets
};
