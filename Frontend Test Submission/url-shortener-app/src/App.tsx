// src/App.tsx (All-in-One File - Final Fixes)

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link as MuiLink, // Alias Link to avoid conflict with react-router-dom's Link
  useTheme // Import useTheme hook
} from '@mui/material';
import { styled } from '@mui/system';

// Corrected import path for logging service (assuming src/services/logService.ts)
// Ensure your logService file is named 'logService.ts' and is in 'src/services/'
import { setAccessToken, Log } from './services/logService';

// --- IMPORTANT: Replace this with your actual access token ---
// This token was obtained from the Authentication step (Phase 1).
// For this project, hardcoding here is acceptable as per instructions.
const YOUR_ACTUAL_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJ1bml5YWx2YWlzaG5hdmk0MEBnbWFpbC5jb20iLCJleHAiOjE3NTI1NTk0NDksImlhdCI6MTc1MjU1ODU0OSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjlhMGM0MDE2LWRhMGEtNGY4Mi1hZjg2LTY3NDhmMDQ4NTRlNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InZhaXNobmF2aSB1bml5YWwiLCJzdWIiOiJiNzM2ZjQ3MC0xYzkxLTQwNWMtOGYxNC1kZTY5NjBjZGEwODYifSwiZW1haWwiOiJ1bml5YWx2YWlzaG5hdmk0MEBnbWFpbC5jb20iLCJuYW1lIjoidmFpc2huYXZpIHVuaXlhbCIsInJvbGxObyI6IjIyMTk4NjkiLCJhY2Nlc3NDb2RlIjoiUUFoRFVyIiwiY2xpZW50SUQiOiJiNzM2ZjQ3MC0xYzkxLTQwNWMtOGYxNC1kZTY5NjBjZGEwODYiLCJjbGllbnRTZWNyZXQiOiJNQUhzS3d5QXNaZ1VxRkhtIn0.i1YL80SC9JAx2iPx3KPZTiP5eTCk4Dy-2WuOq1DM52M";

// --- Styled Components for consistent UI ---
// These components will automatically pick up the theme from ThemeProvider
const AppContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#f0f2f5', // Light grey background
});

const MainContentBox = styled(Box)({
  flexGrow: 1,
  paddingTop: '64px', // To account for the AppBar height
});

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3], // theme.shadows[3] should now be correctly typed
  backgroundColor: theme.palette.background.paper,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2], // theme.shadows[2] should now be correctly typed
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

// --- UTILITY FUNCTIONS AND INTERFACES ---

/**
 * Interface for a single click event on a shortened URL.
 */
interface ClickEvent {
  timestamp: string; // ISO string (e.g., new Date().toISOString())
  source: string;    // User-agent string, or "browser", "mobile"
  geo: string;       // Placeholder for geographical location (e.g., "Unknown Location (Frontend Simulation)")
}

/**
 * Interface for a shortened URL entry stored in local storage.
 */
interface ShortenedUrl {
  id: string; // Unique ID for the shortened URL entry
  originalUrl: string;
  shortCode: string;
  creationDate: string; // ISO string
  expiryDate: string; // ISO string
  clicks: ClickEvent[];
}

// --- IMPORTANT: Redefine LogEntry interface to include new package types ---
// This resolves the TS2345 errors related to 'persistence', 'validation', 'shortener', 'routing', 'app'
interface LogEntry {
    stack: "frontend";
    level: "debug" | "info" | "warn" | "error" | "fatal";
    package: "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils" | "persistence" | "validation" | "shortener" | "routing" | "app";
    message: string;
}

// REMOVED: declare const Log: ...
// This line caused the "Duplicate declaration Log" error.
// The `Log` function is now correctly imported from './services/logService'.


const LOCAL_STORAGE_KEY = 'shortenedUrls';
const BASE_SHORTCODE_LENGTH = 6; // Default length for generated shortcodes

/**
 * Validates if a string is a well-formed URL.
 * @param url The string to validate.
 * @returns True if valid, false otherwise.
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Generates a random alphanumeric shortcode of a specified length.
 * @param length The desired length of the shortcode. Defaults to BASE_SHORTCODE_LENGTH.
 * @returns A random alphanumeric string.
 */
const generateRandomShortcode = (length: number = BASE_SHORTCODE_LENGTH): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Checks if a string consists only of alphanumeric characters.
 * @param shortcode The string to check.
 * @returns True if alphanumeric, false otherwise.
 */
const isAlphanumeric = (shortcode: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(shortcode);
};

/**
 * Retrieves all shortened URLs from the browser's local storage.
 * Logs an error if retrieval fails.
 * @returns An array of ShortenedUrl objects. Returns an empty array if no data or an error occurs.
 */
const getShortenedUrls = (): ShortenedUrl[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    // Corrected package type
    Log("error", "utils", `Failed to retrieve data from localStorage: ${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
};

/**
 * Saves an array of shortened URLs to the browser's local storage.
 * Logs success or error messages.
 * @param urls The array of ShortenedUrl objects to save.
 */
const saveShortenedUrls = (urls: ShortenedUrl[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(urls));
    // Corrected package type
    Log("info", "utils", "Shortened URLs saved to localStorage successfully.");
  } catch (e) {
    // Corrected package type
    Log("error", "utils", `Failed to save data to localStorage: ${e instanceof Error ? e.message : String(e)}`);
  }
};

/**
 * Finds a specific shortened URL entry by its shortcode.
 * @param shortCode The shortcode to search for.
 * @returns The ShortenedUrl object if found, otherwise undefined.
 */
const findUrlByShortcode = (shortCode: string): ShortenedUrl | undefined => {
  const urls = getShortenedUrls();
  return urls.find(url => url.shortCode === shortCode);
};

// --- URLShortenerPage Component ---
const URLShortenerPage: React.FC = () => {
  const [urls, setUrls] = useState<{ originalUrl: string; validity: string; preferredShortcode: string }[]>(
    Array(5).fill({ originalUrl: '', validity: '30', preferredShortcode: '' })
  );
  const [shortenedResults, setShortenedResults] = useState<ShortenedUrl[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  useEffect(() => {
    const existingUrls = getShortenedUrls();
    setShortenedResults(existingUrls);
    Log("info", "page", "URLShortenerPage loaded existing URLs from localStorage.");
  }, []);

  const handleInputChange = (index: number, field: keyof typeof urls[0], value: string) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleShorten = () => {
    const newShortenedUrls: ShortenedUrl[] = [];
    const existingShortcodes = new Set(getShortenedUrls().map(u => u.shortCode));

    urls.forEach((urlInput, index) => {
      const { originalUrl, validity, preferredShortcode } = urlInput;

      if (!originalUrl.trim()) {
        if (urls.filter(u => u.originalUrl.trim()).length > 0) {
            // Corrected package type
            Log("debug", "component", `Row ${index + 1}: Skipping empty URL entry.`);
        }
        return;
      }

      if (!isValidUrl(originalUrl)) {
        showSnackbar(`Row ${index + 1}: Invalid URL format for "${originalUrl}". Please ensure it starts with http:// or https://`, 'error');
        // Corrected package type
        Log("error", "component", `Row ${index + 1}: Invalid URL format: ${originalUrl}`);
        return;
      }

      const validityMinutes = parseInt(validity, 10);
      if (isNaN(validityMinutes) || validityMinutes <= 0) {
        showSnackbar(`Row ${index + 1}: Validity period must be a positive integer.`, 'error');
        // Corrected package type
        Log("error", "component", `Row ${index + 1}: Invalid validity period: ${validity}`);
        return;
      }

      let finalShortcode = preferredShortcode.trim();
      if (finalShortcode) {
        if (!isAlphanumeric(finalShortcode)) {
          showSnackbar(`Row ${index + 1}: Preferred shortcode must be alphanumeric (A-Z, a-z, 0-9).`, 'error');
          // Corrected package type
          Log("error", "component", `Row ${index + 1}: Non-alphanumeric preferred shortcode: ${preferredShortcode}`);
          return;
        }
        if (existingShortcodes.has(finalShortcode)) {
          showSnackbar(`Row ${index + 1}: Preferred shortcode "${finalShortcode}" is already in use. Please choose another.`, 'error');
          // Corrected package type
          Log("error", "component", `Row ${index + 1}: Duplicate preferred shortcode: ${preferredShortcode}`);
          return;
        }
      } else {
        do {
          finalShortcode = generateRandomShortcode();
        } while (existingShortcodes.has(finalShortcode));
      }

      const creationDate = new Date();
      const expiryDate = new Date(creationDate.getTime() + validityMinutes * 60 * 1000);

      const newShortenedUrl: ShortenedUrl = {
        id: crypto.randomUUID(),
        originalUrl,
        shortCode: finalShortcode,
        creationDate: creationDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        clicks: [],
      };

      newShortenedUrls.push(newShortenedUrl);
      existingShortcodes.add(finalShortcode);
      // Corrected package type
      Log("info", "component", `URL processed for shortening: ${originalUrl} -> ${finalShortcode}`);
    });

    if (newShortenedUrls.length > 0) {
      const updatedAllUrls = [...getShortenedUrls(), ...newShortenedUrls];
      saveShortenedUrls(updatedAllUrls);
      setShortenedResults(updatedAllUrls);
      showSnackbar('Selected URLs processed successfully!', 'success');
      // Corrected package type
      Log("info", "component", `Successfully shortened ${newShortenedUrls.length} URLs.`);
      setUrls(Array(5).fill({ originalUrl: '', validity: '30', preferredShortcode: '' }));
    } else if (urls.some(u => u.originalUrl.trim())) {
        showSnackbar('No URLs were successfully shortened. Please correct errors and try again.', 'warning');
        // Corrected package type
        Log("warn", "component", "No URLs were successfully shortened due to input validation failures.");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <StyledContainer maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>
      <Typography variant="body1" align="center" paragraph>
        Enter up to 5 URLs to shorten concurrently.
      </Typography>

      <Grid container spacing={2}>
        {urls.map((urlInput, index) => (
          // Added component="div" to Grid item
          <Grid item xs={12} key={index} component="div">
            <StyledPaper elevation={2}>
              <Typography variant="h6" gutterBottom>URL Entry {index + 1}</Typography>
              <TextField
                fullWidth
                label="Original Long URL (e.g., https://example.com/very/long/path)"
                variant="outlined"
                margin="normal"
                value={urlInput.originalUrl}
                onChange={(e) => handleInputChange(index, 'originalUrl', e.target.value)}
              />
              <TextField
                fullWidth
                label="Validity Period (minutes, e.g., 30)"
                variant="outlined"
                type="number"
                margin="normal"
                value={urlInput.validity}
                onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                inputProps={{ min: "1" }}
              />
              <TextField
                fullWidth
                label="Optional Preferred Shortcode (alphanumeric, e.g., mycode123)"
                variant="outlined"
                margin="normal"
                value={urlInput.preferredShortcode}
                onChange={(e) => handleInputChange(index, 'preferredShortcode', e.target.value)}
              />
            </StyledPaper>
          </Grid>
        ))}
      </Grid>

      <StyledButton
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleShorten}
        sx={{ mt: 3, mb: 2 }}
      >
        Shorten URLs
      </StyledButton>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom align="center">
          Shortened URLs (Current Session)
        </Typography>
        {shortenedResults.length === 0 ? (
          <Typography variant="body2" align="center">No URLs shortened yet. Shortened URLs will appear here.</Typography>
        ) : (
          <List>
            {shortenedResults.map((item) => (
              <ListItem key={item.id} divider>
                <ListItemText
                  primary={
                    <MuiLink href={`/${item.shortCode}`} target="_blank" rel="noopener noreferrer">
                      {window.location.origin}/{item.shortCode}
                    </MuiLink>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        Original: {item.originalUrl}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="textSecondary">
                        Expires: {new Date(item.expiryDate).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

// --- URLStatisticsPage Component ---
const URLStatisticsPage: React.FC = () => {
  const [allShortenedUrls, setAllShortenedUrls] = useState<ShortenedUrl[]>([]);

  useEffect(() => {
    const urls = getShortenedUrls();
    setAllShortenedUrls(urls);
    Log("info", "page", "URLStatisticsPage loaded all URLs from localStorage.");
  }, []);

  return (
    <StyledContainer maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        URL Shortener Statistics
      </Typography>
      {allShortenedUrls.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 3 }}>
          No shortened URLs to display statistics for. Please shorten some URLs on the homepage.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ mt: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="shortened URLs statistics table">
            <TableHead>
              <TableRow>
                <TableCell>Short URL</TableCell>
                <TableCell>Original URL</TableCell>
                <TableCell align="right">Created</TableCell>
                <TableCell align="right">Expires</TableCell>
                <TableCell align="right">Total Clicks</TableCell>
                <TableCell>Click Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allShortenedUrls.map((urlEntry) => (
                <TableRow key={urlEntry.id}>
                  <TableCell component="th" scope="row">
                    <MuiLink href={`/${urlEntry.shortCode}`} target="_blank" rel="noopener noreferrer">
                      {window.location.origin}/{urlEntry.shortCode}
                    </MuiLink>
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{urlEntry.originalUrl}</TableCell>
                  <TableCell align="right">{new Date(urlEntry.creationDate).toLocaleString()}</TableCell>
                  <TableCell align="right">{new Date(urlEntry.expiryDate).toLocaleString()}</TableCell>
                  <TableCell align="right">{urlEntry.clicks.length}</TableCell>
                  <TableCell>
                    {urlEntry.clicks.length > 0 ? (
                      <List dense disablePadding>
                        {urlEntry.clicks.map((click, idx) => (
                          <ListItem key={idx} disableGutters>
                            <ListItemText
                              primary={`Clicked: ${new Date(click.timestamp).toLocaleString()}`}
                              secondary={`Source: ${click.source || 'N/A'}, Geo: ${click.geo || 'N/A'}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No clicks yet.</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </StyledContainer>
  );
};

// --- ShortcodeRedirectHandler Component ---
const ShortcodeRedirectHandler: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Corrected package type
    Log("debug", "routing", `ShortcodeRedirectHandler activated for shortcode: ${shortcode}`);

    if (!shortcode) {
      // Corrected package type
      Log("error", "routing", "ShortcodeRedirectHandler called without a shortcode parameter.");
      navigate('/404');
      return;
    }

    const urlEntry = findUrlByShortcode(shortcode);

    if (urlEntry) {
      const now = new Date();
      const expiry = new Date(urlEntry.expiryDate);

      if (now > expiry) {
        // Corrected package type
        Log("warn", "routing", `Attempted access to expired shortcode: ${shortcode}`);
        navigate('/404');
        return;
      }

      const updatedUrls = getShortenedUrls().map(url => {
        if (url.shortCode === shortcode) {
          const newClick: ClickEvent = {
            timestamp: now.toISOString(),
            source: navigator.userAgent,
            geo: "Unknown Location (Frontend Simulation)",
          };
          return { ...url, clicks: [...url.clicks, newClick] };
        }
        return url;
      });
      saveShortenedUrls(updatedUrls);

      // Corrected package type
      Log("info", "routing", `Redirecting from shortcode '${shortcode}' to '${urlEntry.originalUrl}'.`);
      window.location.replace(urlEntry.originalUrl);
    } else {
      // Corrected package type
      Log("warn", "routing", `Attempted to access non-existent shortcode: ${shortcode}`);
      navigate('/404');
    }
  }, [shortcode, navigate]);

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h5" component="h2" align="center">
        Redirecting...
      </Typography>
      <Typography variant="body1" align="center" mt={2}>
        If you are not redirected, the short URL might be invalid or expired.
      </Typography>
      <Box mt={3}>
        <Typography variant="caption" color="textSecondary">
          Checking for short URL: {shortcode || 'N/A'}
        </Typography>
      </Box>
    </StyledContainer>
  );
};

// --- NotFoundPage Component ---
const NotFoundPage: React.FC = () => {
    useEffect(() => {
        Log("warn", "page", "User navigated to a 404 Not Found page.");
    }, []);

    return (
        <StyledContainer maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                404 - Page Not Found
            </Typography>
            <Typography variant="body1" mt={2}>
                The page you are looking for does not exist or the short URL is invalid/expired.
            </Typography>
            <Box display="flex" justifyContent="center" mt={3}>
                <RouterLink to="/" style={{ textDecoration: 'none' }}>
                    <StyledButton variant="contained" color="primary">
                        Go to Home
                    </StyledButton>
                </RouterLink>
            </Box>
        </StyledContainer>
    );
};


// --- Main App Component ---
function App() {
  useEffect(() => {
    // Set the access token as soon as the app loads
    setAccessToken(YOUR_ACTUAL_ACCESS_TOKEN);

    // Send an initial log indicating app start
    Log("info", "app", "URL Shortener application initialized and loaded.");
  }, []);

  return (
    <Router>
      <AppContainer>
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Affordmed URL Shortener
              </RouterLink>
            </Typography>
            <Button color="inherit" component={RouterLink} to="/">
              Shortener
            </Button>
            <Button color="inherit" component={RouterLink} to="/stats">
              Statistics
            </Button>
          </Toolbar>
        </AppBar>

        <MainContentBox>
          <Routes>
            <Route path="/" element={<URLShortenerPage />} />
            <Route path="/stats" element={<URLStatisticsPage />} />
            <Route path="/:shortcode" element={<ShortcodeRedirectHandler />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainContentBox>
      </AppContainer>
    </Router>
  );
}

export default App;
