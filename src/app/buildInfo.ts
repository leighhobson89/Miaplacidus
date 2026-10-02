export const BUILD_INFO = Object.freeze({
  mode: MIAPLACIDUS_BUILD_MODE,
  isDevelopment: import.meta.env.DEV,
  isTest: MIAPLACIDUS_BUILD_MODE === "test",
  isDemo: MIAPLACIDUS_IS_DEMO_BUILD,
});
