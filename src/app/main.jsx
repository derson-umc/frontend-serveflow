import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryProvider } from './providers/QueryProvider';
import App from './App';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { isTokenExpired } from '@shared/utils/jwt';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/restaurant.css';
import '../index.css';

useAuthStore.getState().hydrate();

setInterval(() => {
  const { token, hydrate } = useAuthStore.getState();
  if (token && isTokenExpired(token)) {
    hydrate();
  }
}, 60_000);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
