const pricingConfig = require('../config/purchaseTierConfig.json');

const promptAvailable = (user) => {
  const tierInfo = pricingConfig[user?.planTier] || pricingConfig.free;
  if (user?.role === 'admin')
    return true;
  if (user?.promptsUsed >= (tierInfo.maxPrompts + tierInfo.extraPrompts))
    return false;
  if ((Date.now() - new Date(user?.planActivatedAt)) >= tierInfo.durationHours * 60 * 60 * 1000)
    return false;
  return true;
}

const downloadAvailable = (user) => {
  const tierInfo = pricingConfig[user?.planTier] || pricingConfig.free;
  if (user?.role === 'admin')
    return true;
  if (user?.planTier === 'free')
    return false;
  if (user?.formUsed >= tierInfo.maxForms)
    return false;
  if ((Date.now() - new Date(user?.planActivatedAt)) >= tierInfo.durationHours * 60 * 60 * 1000)
    return false;
  return true;
}

const formAvailable = (user) => {
  const tierInfo = pricingConfig[user?.planTier] || pricingConfig.free;
  if (user?.role === 'admin')
    return true;
  if (user?.formUsed >= tierInfo.maxForms)
    return false;
  if ((Date.now() - new Date(user?.planActivatedAt)) >= tierInfo.durationHours * 60 * 60 * 1000)
    return false;
  return true;
}

module.exports = {
  downloadAvailable,
  formAvailable,
  promptAvailable
}