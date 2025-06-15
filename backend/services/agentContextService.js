const jwt = require('jsonwebtoken');
const { getUserById, updateUserMetadata } = require('utils/userData');
const { logInfo, logError, logWarn } = require('utils/loggerUtils');
const { validateAgentName } = require('utils/validators');
const { logAuditEvent } = require('services/auditLogService');
const { JWT_SECRET } = require('config/secrets');

async function getActiveAgent(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.id);
    const activeAgent = user?.metadata?.activeAgent || 'Mira';
    return { activeAgent };
  } catch (err) {
    logError(`agentContextService.getActiveAgent failed: ${err.message}`);
    throw new Error('Failed to retrieve active agent');
  }
}

async function setActiveAgent(token, newAgent) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!validateAgentName(newAgent)) {
      throw new Error(`Invalid agent name: ${newAgent}`);
    }

    const user = await getUserById(decoded.id);
    const previousAgent = user?.metadata?.activeAgent || 'Mira';

    const updateResult = await updateUserMetadata(decoded.id, { activeAgent: newAgent });
    if (!updateResult) {
      throw new Error('Failed to update active agent');
    }

    await logAuditEvent({
      userId: decoded.id,
      action: 'AGENT_SWITCH',
      metadata: {
        from: previousAgent,
        to: newAgent,
      },
    });

    return { success: true, message: `Agent set to ${newAgent}` };
  } catch (err) {
    logError(`agentContextService.setActiveAgent failed: ${err.message}`);
    throw new Error('Failed to set active agent');
  }
}

module.exports = {
  getActiveAgent,
  setActiveAgent,
};
