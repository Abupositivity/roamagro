import React, { useState } from 'react';
import { IconButton, Typography, Container, Box, TextField } from '@mui/material';
import AgriFeed from '../components/community/AgriFeed';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const [postContent, setPostContent] = useState('');

  const handleCreatePost = () => {
    if (postContent.trim()) {
      console.log(t('New Agri-Feed post:'), postContent);
      setPostContent('');
    } else {
      alert(t("Post content cannot be empty."));
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          {t('Create New Post')}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder={t("Share tips or insights on agribusiness...")}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleCreatePost}
          >
            {t('Post')}
          </IconButton>
        </Box>
      </Box>

      <Box mt={4} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {t('Agri-Feed')}
        </Typography>
        <AgriFeed />
      </Box>
    </Container>
  );
};

export default Dashboard;