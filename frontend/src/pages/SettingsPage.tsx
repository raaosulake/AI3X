import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getSettings, updateSettings, testConnection, getModels } from '../services/api';
import type { Settings, TestConnectionResult } from '../types';

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    jira_base_url: '',
    jira_username: '',
    jira_api_token: '',
    jira_default_project: '',
    groq_api_key: '',
    groq_model: 'mixtral-8x7b-32768',
    blast_file_path: '',
  });
  const [models, setModels] = useState<string[]>([]);
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<TestConnectionResult | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    getSettings()
      .then((s) => {
        setForm(s);
        if (s.groq_api_key) {
          getModels().then(setModels).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSettings(form);
      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
      if (form.groq_api_key) {
        getModels().then(setModels).catch(() => {});
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testConnection();
      setConnectionResult(result);
    } catch {
      setConnectionResult({
        jira: false,
        groq: false,
        blast: false,
        jira_message: 'Connection test failed',
        groq_message: 'Connection test failed',
        blast_message: 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Configure your JIRA, AI, and knowledge base connections
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                JIRA Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="JIRA Base URL"
                placeholder="https://your-domain.atlassian.net"
                value={form.jira_base_url}
                onChange={handleChange('jira_base_url')}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Username / Email"
                placeholder="user@example.com"
                value={form.jira_username}
                onChange={handleChange('jira_username')}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="API Token"
                type={showJiraToken ? 'text' : 'password'}
                value={form.jira_api_token}
                onChange={handleChange('jira_api_token')}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowJiraToken(!showJiraToken)} edge="end" size="small">
                        {showJiraToken ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Default Project Key"
                placeholder="PROJ"
                value={form.jira_default_project}
                onChange={handleChange('jira_default_project')}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Configuration (Groq)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Groq API Key"
                type={showGroqKey ? 'text' : 'password'}
                value={form.groq_api_key}
                onChange={handleChange('groq_api_key')}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowGroqKey(!showGroqKey)} edge="end" size="small">
                        {showGroqKey ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                select
                label="Model"
                value={form.groq_model}
                onChange={handleChange('groq_model')}
                size="small"
                sx={{ mb: 2 }}
                SelectProps={{ native: true }}
              >
                {(models.length > 0 ? models : ['mixtral-8x7b-32768', 'llama2-70b-4096']).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </TextField>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Knowledge Source
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="B.L.A.S.T.md File Path"
                value={form.blast_file_path}
                onChange={handleChange('blast_file_path')}
                size="small"
                sx={{ mb: 1 }}
                helperText="Path to the B.L.A.S.T.md knowledge base file"
              />
            </CardContent>
          </Card>

          {connectionResult && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Connection Test Results
                </Typography>
                <Alert severity={connectionResult.jira ? 'success' : 'warning'} sx={{ mb: 1 }}>
                  JIRA: {connectionResult.jira_message}
                </Alert>
                <Alert severity={connectionResult.groq ? 'success' : 'warning'} sx={{ mb: 1 }}>
                  Groq AI: {connectionResult.groq_message}
                </Alert>
                <Alert severity={connectionResult.blast ? 'success' : 'warning'}>
                  B.L.A.S.T. File: {connectionResult.blast_message}
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : undefined}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        <Button variant="outlined" onClick={handleTestConnection} disabled={testing} startIcon={testing ? <CircularProgress size={16} /> : undefined}>
          {testing ? 'Testing...' : 'Test Connections'}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
