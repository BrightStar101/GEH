/**
 * ipUtils.js
 *
 * Validates, sanitizes, and anonymizes IP addresses for logging and analytics
 */

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|\d\d?)\.(25[0-5]|2[0-4]\d|1\d\d|\d\d?)\.(25[0-5]|2[0-4]\d|1\d\d|\d\d?)\.(25[0-5]|2[0-4]\d|1\d\d|\d\d?)$/;

/**
 * Validates if an IP address is a valid public IPv4
 * @param {string} ip
 * @returns {boolean}
 */
function isValidIPv4(ip) {
  return IPV4_REGEX.test(ip);
}

/**
 * Checks if the IP is a private or local range
 * @param {string} ip
 * @returns {boolean}
 */
function isPrivateIP(ip) {
  if (!isValidIPv4(ip)) return false;
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.20.') ||
    ip.startsWith('172.21.') ||
    ip.startsWith('172.22.') ||
    ip.startsWith('172.23.') ||
    ip.startsWith('172.24.') ||
    ip.startsWith('172.25.') ||
    ip.startsWith('172.26.') ||
    ip.startsWith('172.27.') ||
    ip.startsWith('172.28.') ||
    ip.startsWith('172.29.') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.') ||
    ip === '127.0.0.1'
  );
}

/**
 * Anonymizes the IP for export or logs (e.g., GDPR-safe)
 * @param {string} ip
 * @returns {string}
 */
function anonymizeIP(ip) {
  if (!isValidIPv4(ip)) return '';
  const parts = ip.split('.');
  return `${parts[0]}.${parts[1]}.XXX.XXX`;
}

module.exports = {
  isValidIPv4,
  isPrivateIP,
  anonymizeIP,
};
