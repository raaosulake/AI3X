import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MarkdownPreview from '../components/MarkdownPreview';
import ExportButtons from '../components/ExportButtons';
import { generateTestStrategy, exportTestStrategy } from '../services/api';

const TEST_TYPES = ['Functional', 'Regression', 'Integration', 'System', 'Smoke', 'Sanity', 'Performance', 'Security', 'User Acceptance'];
const ENVIRONMENTS = ['QA', 'Staging', 'Development', 'Production', 'UAT', 'Integration'];

export default function TestStrategyPage() {
  const [jiraId, setJiraId] = useState('');
  const [testType, setTestType] = useState('Functional');
  const [environment, setEnvironment] = useState('QA');
  const [releaseVersion, setReleaseVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; title: string; jira_id: string } | null>(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleGenerate = async () => {
    if (!jiraId.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await generateTestStrategy({ jira_id: jiraId, test_type: testType, environment, release_version: releaseVersion });
      setResult(res);
      setSnackbar({ open: true, message: 'Test Strategy generated successfully!', severity: 'success' });
    } catch {
      setError('Failed to generate Test Strategy. Check settings and JIRA ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generate Test Strategy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Create comprehensive test strategy documents from JIRA issues
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Input Parameters
              </Typography>
              <TextField
                fullWidth
                label="JIRA ID"
                placeholder="PROJ-123"
                value={jiraId}
                onChange={(e) => setJiraId(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                select
                label="Test Type"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              >
                {TEST_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              >
                {ENVIRONMENTS.map((e) => (
                  <MenuItem key={e} value={e}>{e}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Release Version"
                placeholder="e.g. v2.1.0"
                value={releaseVersion}
                onChange={(e) => setReleaseVersion(e.target.value)}
                size="small"
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleGenerate}
                disabled={loading || !jiraId.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Generating...' : 'Generate Strategy'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!result && !error && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Enter a JIRA ID and click Generate
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  The Test Strategy will be generated using AI with B.L.A.S.T. methodology context
                </Typography>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{result.title}</Typography>
                <ExportButtons
                  content={result.content}
                  filename={`test-strategy-${result.jira_id}`}
                  onExport={(format) => exportTestStrategy(result.content, format, `test-strategy-${result.jira_id}`)}
                />
              </Box>
              <MarkdownPreview content={result.content} />
            </>
          )}
        </Grid>
      </Grid>

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
