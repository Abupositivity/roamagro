import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopics, createTopic } from '../../redux/actions/communityActions';
import { Container, TextField, Button, Typography, Paper, List, ListItem, Snackbar, Alert } from '@mui/material';

const Community = () => {
  const dispatch = useDispatch();
  const { topics } = useSelector((state) => state.community);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  const handleCreate = () => {
    const topicData = { title: newTopicTitle, content: newTopicContent, category: 'general' };
    dispatch(createTopic(topicData));
    setNewTopicTitle('');
    setNewTopicContent('');
    console.log("Topic created successfully");
    setSnackbarOpen(true);
  };

  return (
    <Container>
      <Typography variant="h4">Community Interaction</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="Topic Title"
          value={newTopicTitle}
          onChange={(e) => setNewTopicTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Content"
          value={newTopicContent}
          onChange={(e) => setNewTopicContent(e.target.value)}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        <Button onClick={handleCreate} color="primary" variant="contained">
          Create Topic
        </Button>
      </Paper>
      <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {topics.map((topic) => (
          <ListItem key={topic._id}>
            <Typography variant="h6">{topic.title}</Typography>
            <Typography variant="body2">Replies: {topic.comments.length}</Typography>
          </ListItem>
        ))}
      </List>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Topic created successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Community;