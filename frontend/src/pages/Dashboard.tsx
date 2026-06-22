import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getDashboardStats, getSettings } from '../services/api';
import type { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboardStats(), getSettings()])
      .then(([s, cfg]) => {
        setStats(s);
        setSettings(cfg);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const lastDoc = stats?.last_document;
  const recent = stats?.recent_activities || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your QA documentation activities
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats?.total_documents || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Documents
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" noWrap>
                    {lastDoc?.title || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Generated
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinkIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" noWrap>
                    {settings?.jira_default_project || 'Not Set'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    JIRA Project
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Chip
                    label={settings?.groq_api_key ? 'API Connected' : 'Not Configured'}
                    color={settings?.groq_api_key ? 'success' : 'warning'}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Groq API Status
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          {recent.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No activities yet. Generate your first document to get started.
            </Typography>
          ) : (
            <List disablePadding>
              {recent.map((item) => (
                <ListItem key={item.id} divider sx={{ px: 0 }}>
                  <ListItemText
                    primary={item.title}
                    secondary={`${item.document_type} - ${new Date(item.created_at).toLocaleString()}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip label={item.jira_id} size="small" variant="outlined" />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
