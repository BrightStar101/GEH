const { getActiveAgent, setActiveAgent } = require('services/agentContextService');
const userData = require('utils/userData');
const jwt = require('jsonwebtoken');
const audit = require('services/auditLogService');

jest.mock('jsonwebtoken');
jest.mock('../../utils/userData');
jest.mock('../../services/auditLogService');

describe('agentContextService', () => {
  const mockToken = 'mock.jwt.token';
  const mockUserId = 'user123';
  const mockDecoded = { id: mockUserId };

  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify.mockReturnValue(mockDecoded);
  });

  describe('getActiveAgent', () => {
    it('should return active agent from user metadata', async () => {
      userData.getUserById.mockResolvedValue({ metadata: { activeAgent: 'Kairo' } });

      const result = await getActiveAgent(mockToken);
      expect(result).toEqual({ activeAgent: 'Kairo' });
    });

    it('should default to Mira if metadata missing', async () => {
      userData.getUserById.mockResolvedValue({});
      const result = await getActiveAgent(mockToken);
      expect(result).toEqual({ activeAgent: 'Mira' });
    });

    it('should throw error on token failure', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
      await expect(getActiveAgent(mockToken)).rejects.toThrow('Failed to retrieve active agent');
    });
  });

  describe('setActiveAgent', () => {
    it('should update and log agent switch', async () => {
      userData.getUserById.mockResolvedValue({ metadata: { activeAgent: 'Mira' } });
      userData.updateUserMetadata.mockResolvedValue(true);
      audit.logAuditEvent.mockResolvedValue(true);

      const result = await setActiveAgent(mockToken, 'Lumo');

      expect(result.success).toBe(true);
      expect(audit.logAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
        userId: mockUserId,
        action: 'AGENT_SWITCH',
        metadata: { from: 'Mira', to: 'Lumo' }
      }));
    });

    it('should fail with invalid agent name', async () => {
      await expect(setActiveAgent(mockToken, 'Invalid')).rejects.toThrow('Failed to set active agent');
    });

    it('should handle failed metadata update', async () => {
      userData.getUserById.mockResolvedValue({ metadata: { activeAgent: 'Mira' } });
      userData.updateUserMetadata.mockResolvedValue(false);
      await expect(setActiveAgent(mockToken, 'Kairo')).rejects.toThrow('Failed to set active agent');
    });
  });
});
