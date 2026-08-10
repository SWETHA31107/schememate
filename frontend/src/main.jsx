import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
