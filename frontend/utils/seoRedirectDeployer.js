/**
 * seoRedirectDeployer.js
 *
 * GEH - SEO Redirect Handler
 *
 * Dynamically sets <head> meta tags and performs soft or hard redirect
 * based on configured delay. Fully ESM, telemetry-ready, and SSR-safe.
 */

export function injectSeoRedirect({
  title = 'Redirecting...',
  description = 'Please wait while we redirect you...',
  redirectUrl = '/',
  delay = 5,
  hardRedirect = false,
  languageCode = 'en-US',
}) {
  if (typeof document === 'undefined') {
    console.debug('[SEO] Document not available (SSR mode)');
    return;
  }

  try {
    const head = document.head;

    const metaTitle = document.createElement('title');
    metaTitle.textContent = title;
    head.appendChild(metaTitle);

    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = description;
    head.appendChild(metaDesc);

    const metaLang = document.createElement('meta');
    metaLang.httpEquiv = 'content-language';
    metaLang.content = languageCode;
    head.appendChild(metaLang);

    const metaRefresh = document.createElement('meta');
    metaRefresh.httpEquiv = 'refresh';
    metaRefresh.content = `${delay};url=${redirectUrl}`;
    head.appendChild(metaRefresh);

    console.debug(`[SEO] Preparing ${hardRedirect ? 'hard' : 'soft'} redirect to ${redirectUrl} in ${delay}s`);

    if (hardRedirect) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, delay * 1000);
    }

  } catch (err) {
    console.error('🚨 SEO redirect injection failed:', err);
  }
}
