const fs = require('fs');
const path = require('path');

const triggerMap = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, '../config/claTriggerMap.json'),
    'utf-8'
  )
);

function isValidPayload({ agent, flags }) {
  return (
    typeof agent === 'string' &&
    Array.isArray(flags) &&
    flags.every(flag => typeof flag === 'string')
  );
}

function shouldRetrain({ agent, flags }) {
  try {
    if (!isValidPayload({ agent, flags })) return false;

    const agentTriggers = triggerMap[agent];
    if (!agentTriggers) return false;

    const allTriggers = [
      ...(agentTriggers.low_confidence || []),
      ...(agentTriggers.high_risk || [])
    ];

    return flags.some(flag => allTriggers.includes(flag));
  } catch (err) {
    console.error('Error in CLA Partitioning:', err);
    return false;
  }
}

module.exports = {
  shouldRetrain,
};
