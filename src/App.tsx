import React from 'react';
import { SnackbarProvider } from 'notistack';
import { GlobalStateProvider } from './global-state';
import { Authorise } from './components/auth/Authorise';
import { Main } from './pages/main/Main';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GlobalStateProvider>
          <Authorise>
            <Main />
          </Authorise>
        </GlobalStateProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
