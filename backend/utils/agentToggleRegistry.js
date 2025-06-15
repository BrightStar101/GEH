// backend/utils/agentToggleRegistry.js

const toggleState = {
  autoRetrain: true,
  confidenceHeatmap: true,
  fairnessWatchdog: true,
  crisisMode: false,
  driftMonitor: true,
};

function getAllToggles() {
  return Object.entries(toggleState).map(([key, value]) => ({
    id: key,
    enabled: value,
  }));
}

function updateToggle(toggleId, enabled) {
  if (!(toggleId in toggleState)) {
    return { success: false, message: `Toggle '${toggleId}' not found.` };
  }

  toggleState[toggleId] = enabled;
  return { success: true, id: toggleId, enabled };
}

function isToggleEnabled(toggleId) {
  return toggleState[toggleId] === true;
}

module.exports = {
  getAllToggles,
  updateToggle,
  isToggleEnabled,
};
