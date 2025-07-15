// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define a basic Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A standard blue
    },
    secondary: {
      main: '#dc004e', // A standard red
    },
    background: {
      default: '#f0f2f5', // Light grey background
      paper: '#ffffff', // White for cards/papers
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Use Inter font
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners to all buttons
          textTransform: 'none', // Prevent uppercase text by default
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Apply rounded corners to all Paper components
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8, // Apply rounded corners to text field borders
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* CssBaseline provides a consistent baseline for styling */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
