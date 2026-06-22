import React from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'grey.50',
        '& h1, & h2, & h3': { color: 'primary.main', mt: 3, mb: 1.5 },
        '& h1': { borderBottom: 2, borderColor: 'primary.main', pb: 1 },
        '& h2': { borderBottom: 1, borderColor: 'divider', pb: 0.5 },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          mb: 2,
          '& th, & td': {
            border: 1,
            borderColor: 'divider',
            p: 1.5,
            textAlign: 'left',
          },
          '& th': { backgroundColor: 'action.hover', fontWeight: 600 },
        },
        '& code': {
          backgroundColor: 'action.hover',
          px: 1,
          py: 0.25,
          borderRadius: 1,
          fontSize: '0.875em',
        },
        '& pre': {
          backgroundColor: 'action.hover',
          p: 2,
          borderRadius: 2,
          overflow: 'auto',
          '& code': { backgroundColor: 'transparent', p: 0 },
        },
        '& ul, & ol': { pl: 3 },
        '& li': { mb: 0.5 },
        '& blockquote': {
          borderLeft: 4,
          borderColor: 'primary.main',
          pl: 2,
          py: 0.5,
          my: 2,
          backgroundColor: 'action.hover',
          borderRadius: '0 8px 8px 0',
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Paper>
  );
}
