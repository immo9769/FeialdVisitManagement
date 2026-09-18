import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';

interface GenericPageProps {
  title: string;
  description: string;
}

export const GenericPage: React.FC<GenericPageProps> = ({ title, description }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>

      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
            {title} Module Infrastructure Ready
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
            This module interface is connected to the Sprint 1 frozen architecture baseline, REST API endpoints, JWT security context, and MySQL database schema.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
