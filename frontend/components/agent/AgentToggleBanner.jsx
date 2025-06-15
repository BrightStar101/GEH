// File: /frontend/components/agent/AgentToggleBanner.jsx
// Purpose: Visual agent context toggle with branding — now includes Kairo avatar support

import React, { useEffect, useState } from "react";
import { getActiveAgent, setActiveAgent } from "../../services/agentContextService";
import { logger } from "../../utils/logger";
import { getAgentTheme } from "../../utils/getAgentTheme";

/**
 * AgentToggleBanner.jsx
 * Displays a toggle banner allowing users to switch between GEH agent contexts (Mira, Kairo, Lumo).
 * Syncs with backend context and visually adjusts UI based on active agent.
 *
 * Props:
 * - token: JWT auth token (required)
 * - availableAgents: array of agent names (["Mira", "Kairo", "Lumo"])
 * - onSwitch: optional callback after agent context changes
 */
export default function AgentToggleBanner({ token, availableAgents = [], onSwitch = () => {} }) {
  const [activeAgent, setActive] = useState("Mira");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadAgent() {
      try {
        const result = await getActiveAgent(token);
        if (result?.activeAgent) {
          setActive(result.activeAgent);
        }
      } catch (err) {
        logger.error("AgentToggleBanner.loadAgent failed", err);
        setError("Could not determine active agent.");
      } finally {
        setLoading(false);
      }
    }

    loadAgent();
  }, [token]);

  const handleSwitch = async (agent) => {
    try {
      setProcessing(true);
      const result = await setActiveAgent(agent, token);
      if (result?.success) {
        setActive(agent);
        onSwitch(agent);
      }
    } catch (err) {
      logger.error(`AgentToggleBanner.handleSwitch failed for ${agent}`, err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6">
      <p className="text-sm mb-3 text-gray-600">Select your current assistant:</p>
      <div className="flex gap-3 items-center">
        {availableAgents.map((agent) => {
          const theme = getAgentTheme(agent);
          const isActive = agent === activeAgent;
          return (
            <button
              key={agent}
              onClick={() => handleSwitch(agent)}
              disabled={processing}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${isActive ? `bg-${theme.primary}-600 text-white` : "bg-white border border-gray-300 text-gray-700"}`}
            >
              <div className="flex items-center gap-2">
                {agent === "Kairo" && (
                  <img
                    src="/images/kairo.png"
                    alt="Kairo Compass Avatar"
                    width="28"
                    height="28"
                    className="rounded-full border border-teal-200 shadow-sm"
                  />
                )}
                <span>{agent}</span>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
