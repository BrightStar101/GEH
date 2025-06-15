// const languageLoaders = {
//   "en-US": () => import("./pdfLabels.en.json", { assert: { type: "json" } }),
//   "es-ES": () => import("./pdfLabels.es.json", { assert: { type: "json" } }),
//   "es-MX": () => import("./pdfLabels.es.family.json", { assert: { type: "json" } }),
//   "hi-IN": () => import("./pdfLabels.hi.json", { assert: { type: "json" } }),
//   "zh-CN": () => import("./pdfLabels.zh.json", { assert: { type: "json" } }),
//   "fr-FR": () => import("./pdfLabels.fr.json", { assert: { type: "json" } }),
//   "ar-SA": () => import("./pdfLabels.ar.json", { assert: { type: "json" } }),
//   "pt-PT": () => import("./pdfLabels.pt.json", { assert: { type: "json" } }),
//   "tl-PH": () => import("./pdfLabels.tl.json", { assert: { type: "json" } }),
//   "uk-UA": () => import("./pdfLabels.uk.json", { assert: { type: "json" } }),
// };

// export async function getLabels(locale) {
//   const loader = languageLoaders[locale] || languageLoaders["en-US"];
//   try {
//     const module = await loader();
//     return module.default;
//   } catch (err) {
//     console.error(`❌ Failed to load i18n labels for locale: ${locale}`, err);
//     return (await languageLoaders["en-US"]()).default;
//   }
// }
