const AgentToggle = require('models/agentToggleModel');
const fallbackRegistry = require('../utils/agentToggleRegistry'); // ✅ optional fallback

async function getAllToggles() {
  try {
    const toggles = await AgentToggle.find({});
    if (!toggles || toggles.length === 0) {
      return fallbackRegistry.getAllToggles(); // ✅ fallback to in-memory
    }
    return toggles;
  } catch (err) {
    console.error("getAllToggles error:", err);
    return fallbackRegistry.getAllToggles(); // ✅ graceful fallback on error
  }
}

async function updateToggle(key, enabled, adminId) {
  try {
    const result = await AgentToggle.findOneAndUpdate(
      { key },
      {
        enabled,
        lastUpdated: new Date(),
        lastModifiedBy: adminId,
      },
      { new: true }
    );

    if (!result) {
      return { success: false, message: "Toggle not found." };
    }

    return { success: true, updatedToggle: result };
  } catch (err) {
    console.error("updateToggle error:", err);
    return fallbackRegistry.updateToggle(key, enabled); // ✅ fallback logic
  }
}

module.exports = {
  getAllToggles,
  updateToggle,
};
