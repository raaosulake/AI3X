import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import MarkdownPreview from '../components/MarkdownPreview';
import { getHistory, deleteHistoryItem, getHistoryItem, exportHistoryItem } from '../services/api';
import type { HistoryItem } from '../types';

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchHistory = () => {
    setLoading(true);
    getHistory()
      .then(setItems)
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleView = async (id: number) => {
    try {
      const item = await getHistoryItem(id);
      setSelected(item);
      setViewOpen(true);
    } catch {
      setError('Failed to load document');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError('Failed to delete item');
    }
  };

  const handleExport = async (id: number, format: string) => {
    try {
      const result = await exportHistoryItem(id, format);
      window.open(`/${result.file_path.replace(/\\/g, '/')}`, '_blank');
    } catch {
      setError('Export failed');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Test Strategy':
        return 'primary';
      case 'Test Plan':
        return 'secondary';
      case 'Root Cause Analysis':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        History
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        View, download, and manage generated documents
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No documents generated yet
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Generated documents will appear here for viewing and export
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>JIRA ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{item.title}</TableCell>
                    <TableCell>
                      <Chip label={item.jira_id} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.document_type}
                        size="small"
                        color={getTypeColor(item.document_type) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => handleView(item.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export Markdown">
                        <IconButton size="small" onClick={() => handleExport(item.id, 'markdown')}>
                          <FileDownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export PDF">
                        <IconButton size="small" onClick={() => handleExport(item.id, 'pdf')}>
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export DOCX">
                        <IconButton size="small" onClick={() => handleExport(item.id, 'docx')}>
                          <DescriptionIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent dividers>
          {selected && <MarkdownPreview content={selected.content} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          {selected && (
            <>
              <Button onClick={() => handleExport(selected.id, 'markdown')} startIcon={<FileDownloadIcon />}>
                Markdown
              </Button>
              <Button onClick={() => handleExport(selected.id, 'pdf')} startIcon={<PictureAsPdfIcon />}>
                PDF
              </Button>
              <Button onClick={() => handleExport(selected.id, 'docx')} startIcon={<DescriptionIcon />}>
                DOCX
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
