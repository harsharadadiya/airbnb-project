import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@/theme/muiTheme';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* enableCssLayer puts MUI styles inside @layer mui so Tailwind classes can override them */}
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={muiTheme}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>
);
