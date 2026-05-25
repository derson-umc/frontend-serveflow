export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api',
  WS_BASE_URL:  import.meta.env.VITE_WS_BASE_URL  ?? 'ws://localhost:8080',
  APP_ENV:      import.meta.env.MODE ?? 'development',
  IS_DEV:       import.meta.env.DEV  ?? true,
  IS_PROD:      import.meta.env.PROD ?? false,
};
