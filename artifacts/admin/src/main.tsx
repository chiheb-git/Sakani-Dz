import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';
import { AuthProvider } from './contexts/AuthContext';

import App from './App';

import './index.css';

// Configure API base URL and auth token injection for all API calls
setBaseUrl(import.meta.env.VITE_API_URL ?? 'http://localhost:4000');
setAuthTokenGetter(() => localStorage.getItem('sakani_admin_token'));

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
