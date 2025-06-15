/**
 * geoResolverService.js
 *
 * GEH IP-based Geolocation Utility
 * Uses ipapi.co to resolve user region metadata
 */

const axios = require('axios');
const { isValidIPv4, isPrivateIP } = require('../utils/ipUtils');
const logger = require('../utils/loggerUtils');

const DEFAULT_RESOLVER_URL = 'https://ipapi.co';
const TIMEOUT_MS = 3000;

/**
 * Resolves city, region, and country for a public IP address
 * @param {string} ip - IP address string
 * @returns {Promise<{ city: string, region: string, country: string }>}
 */
async function resolveGeoMetadata(ip) {
  if (!ip || !isValidIPv4(ip) || isPrivateIP(ip)) {
    return { city: 'unknown', region: 'unknown', country: 'unknown' };
  }

  try {
    const url = `${DEFAULT_RESOLVER_URL}/${ip}/json/`;
    const { data } = await axios.get(url, { timeout: TIMEOUT_MS });

    return {
      city: data.city || 'unknown',
      region: data.region || data.region_name || 'unknown',
      country: data.country_name || data.country || 'unknown',
    };
  } catch (error) {
    logger.logWarn(`GeoResolverService: Failed to resolve IP ${ip}.`, error.message);
    return { city: 'unknown', region: 'unknown', country: 'unknown' };
  }
}

module.exports = {
  resolveGeoMetadata,
};
