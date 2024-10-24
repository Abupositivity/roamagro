import React, { useState } from 'react';
import { IconButton, Typography, Container, Box, TextField } from '@mui/material';
import AgriFeed from '../components/community/AgriFeed';

const Dashboard = () => {
  const [postContent, setPostContent] = useState('');

  const handleCreatePost = () => {
    if (postContent) {
      console.log('New Agri-Feed post:', postContent);
      setPostContent('');
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Space to Create a New Agri-Feed Post */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Create New Post
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Share tips or insights on agribusiness..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
        />
        <Box mt={-5}>
          <IconButton
            variant="contained"
            color="primary"
            onClick={handleCreatePost}
            style={{ marginTop: '50px' }}
          >
            Post
          </IconButton>
        </Box>
      </Box>

      {/* Agri-Feed Section with Scrolling */}
      <Box mt={4} style={{ maxHeight: '400px', overflowY: 'auto' }}> {/* Set height and enable scrolling */}
        <Typography variant="h5" gutterBottom>
          Agri-Feed
        </Typography>
        <AgriFeed />
      </Box>
    </Container>
  );
};

export default Dashboard;