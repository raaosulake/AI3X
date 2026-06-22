import React, { useState } from 'react';
import { Stack, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';

interface ExportButtonsProps {
  content: string;
  filename: string;
  onExport: (format: string) => Promise<any>;
}

export default function ExportButtons({ content, filename, onExport }: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleExport = async (format: string) => {
    if (!content) return;
    setLoading(format);
    try {
      const result = await onExport(format);
      setSnackbar({ open: true, message: `Exported as ${format.toUpperCase()} successfully!`, severity: 'success' });
      window.open(`/${result.file_path.replace(/\\/g, '/')}`, '_blank');
    } catch {
      setSnackbar({ open: true, message: 'Export failed. Check server configuration.', severity: 'error' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading === 'markdown' ? <CircularProgress size={16} /> : <FileDownloadIcon />}
          onClick={() => handleExport('markdown')}
          disabled={!!loading || !content}
        >
          Markdown
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="secondary"
          startIcon={loading === 'pdf' ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
          onClick={() => handleExport('pdf')}
          disabled={!!loading || !content}
        >
          PDF
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading === 'docx' ? <CircularProgress size={16} /> : <DescriptionIcon />}
          onClick={() => handleExport('docx')}
          disabled={!!loading || !content}
        >
          DOCX
        </Button>
      </Stack>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
