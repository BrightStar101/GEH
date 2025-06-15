/**
 * shouldFlagStory
 * @desc Analyzes a submitted story and returns true if flagged for moderation
 * @param {string} storyText
 * @returns {boolean}
 */
function shouldFlagStory(storyText) {
  if (!storyText || typeof storyText !== 'string') return true;

  const lowercased = storyText.toLowerCase();

  // Profanity list — can be extended or moved to config file
  const bannedTerms = [
    'hate',
    'kill',
    'attack',
    'rape',
    'bomb',
    'terrorist',
    'racist',
    'suicide',
    'abuse',
    'nazi',
    'slur',
    'slavery',
    'sexually explicit',
    'explicit language',
    'illegal immigration is evil', // contextual trigger
  ];

  // Flag if any banned term is found
  const found = bannedTerms.some((term) => lowercased.includes(term));
  return found;
}

module.exports = {
  shouldFlagStory,
};
