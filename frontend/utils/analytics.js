// Production-safe wrapper for custom analytics + GA
export const logPageView = (page) => {
  if (typeof window !== "undefined") {
    // console.log(`[Analytics] Page view: ${page}`);
    if (window.gtag) {
      window.gtag("event", "page_view", { page_path: page });
    }
  }
};

export const logEvent = (category, action, label = "") => {
  if (typeof window !== "undefined") {
    // console.log(`[Analytics] Event: ${category} - ${action}`);
    if (window.gtag) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
      });
    }
  }
};

export const logPromptInteraction = ({ intent, tone, tokensUsed }) => {
  logEvent("Prompt", "Interaction", `${intent} | ${tone} | ${tokensUsed}`);
};
