const fs = require('fs');
const path = require('path');

async function getAuditLog({ logType, userId, contains, page = 1, limit = 50 }) {
  const logMap = {
    stripe: '../../logs/stripe-events.log',
    paypal: '../../logs/paypal-events.log',
    admin: '../../logs/admin-override.log',
    access: '../../logs/admin-access.log',
  };

  try {
    const filePath = logMap[logType];
    if (!filePath) throw new Error('Invalid log type');

    const absolutePath = path.join(__dirname, filePath);
    if (!fs.existsSync(absolutePath)) {
      return {
        total: 0,
        page,
        limit,
        entries: [`[No log file found for type: ${logType}]`],
      };
    }

    const raw = fs.readFileSync(absolutePath, 'utf-8');
    const lines = raw.trim().split('\n').reverse();

    const filtered = lines.filter((line) => {
      const matchesUser = userId ? line.includes(`user=${userId}`) : true;
      const matchesKeyword = contains ? line.toLowerCase().includes(contains.toLowerCase()) : true;
      return matchesUser && matchesKeyword;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      entries: paginated,
    };
  } catch (err) {
    console.error('AdminAuditService Error:', err.message);
    return {
      total: 0,
      page: 1,
      limit: 0,
      entries: [`[ERROR] Failed to read audit log: ${err.message}`],
    };
  }
}

module.exports = { getAuditLog };
