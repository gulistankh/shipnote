import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import globalCss from './theme/globalStyles';
import { ToastProvider } from './context/ToastContext';
import App from './App.jsx';

const styleTag = document.createElement('style');
styleTag.textContent = globalCss;
document.head.appendChild(styleTag);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);