import React from 'react';
import { GlobalStateProvider } from './global-state';
import { Main } from './pages/Main';

function App() {
  return (
  <GlobalStateProvider>
    <Main />
  </GlobalStateProvider>
  );
}

export default App;
