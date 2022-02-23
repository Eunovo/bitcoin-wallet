import React from 'react';
import { SnackbarProvider } from 'notistack';
import { GlobalStateProvider } from './global-state';
import { Main } from './pages/Main';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GlobalStateProvider>
          <Main />
        </GlobalStateProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
