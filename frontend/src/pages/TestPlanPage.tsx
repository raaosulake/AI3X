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
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MarkdownPreview from '../components/MarkdownPreview';
import ExportButtons from '../components/ExportButtons';
import { generateTestPlan, exportTestPlan } from '../services/api';

export default function TestPlanPage() {
  const [jiraId, setJiraId] = useState('');
  const [sprint, setSprint] = useState('');
  const [release, setRelease] = useState('');
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
      const res = await generateTestPlan({ jira_id: jiraId, sprint, release });
      setResult(res);
      setSnackbar({ open: true, message: 'Test Plan generated successfully!', severity: 'success' });
    } catch {
      setError('Failed to generate Test Plan. Check settings and JIRA ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Generate Test Plan
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Create detailed test plans with scenarios, resources, and risk analysis
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
                label="Sprint"
                placeholder="e.g. Sprint 12"
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Release"
                placeholder="e.g. v3.0.0"
                value={release}
                onChange={(e) => setRelease(e.target.value)}
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
                {loading ? 'Generating...' : 'Generate Test Plan'}
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
                  A comprehensive test plan will be generated with scenarios and resource allocation
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
                  filename={`test-plan-${result.jira_id}`}
                  onExport={(format) => exportTestPlan(result.content, format, `test-plan-${result.jira_id}`)}
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
