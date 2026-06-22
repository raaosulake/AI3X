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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MarkdownPreview from '../components/MarkdownPreview';
import ExportButtons from '../components/ExportButtons';
import { generateRCA, exportRCA } from '../services/api';

export default function RCAPage() {
  const [jiraId, setJiraId] = useState('');
  const [defectId, setDefectId] = useState('');
  const [failureLogs, setFailureLogs] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [analysisType, setAnalysisType] = useState('standard');
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
      const res = await generateRCA({ jira_id: jiraId, defect_id: defectId, failure_logs: failureLogs, error_message: errorMessage, analysis_type: analysisType });
      setResult(res);
      setSnackbar({ open: true, message: 'RCA generated successfully!', severity: 'success' });
    } catch {
      setError('Failed to generate RCA. Check settings and inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Root Cause Analysis
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Perform root cause analysis with 5 Whys or Fishbone methodology
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
                label="Defect ID"
                placeholder="DEF-456"
                value={defectId}
                onChange={(e) => setDefectId(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Error Message"
                placeholder="Error message from logs"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                size="small"
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Failure Logs"
                placeholder="Paste failure logs here..."
                value={failureLogs}
                onChange={(e) => setFailureLogs(e.target.value)}
                size="small"
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                Analysis Method
              </Typography>
              <ToggleButtonGroup
                value={analysisType}
                exclusive
                onChange={(_, val) => val && setAnalysisType(val)}
                size="small"
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="standard">Standard</ToggleButton>
                <ToggleButton value="5whys">5 Whys</ToggleButton>
                <ToggleButton value="fishbone">Fishbone</ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleGenerate}
                disabled={loading || !jiraId.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Generating...' : 'Generate RCA'}
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
                  Root cause analysis will be generated with corrective and preventive actions
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
                  filename={`rca-${result.jira_id}`}
                  onExport={(format) => exportRCA(result.content, format, `rca-${result.jira_id}`)}
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
