export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api',
  },
});
