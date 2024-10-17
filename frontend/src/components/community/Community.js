import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopics, createTopic } from '../../redux/actions/communityActions';
import { Container, TextField, Button, Typography, Paper, List, ListItem } from '@material-ui/core';

const Community = () => {
  const dispatch = useDispatch();
  const { topics } = useSelector((state) => state.community);
  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    dispatch(fetchTopics());
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(createTopic({ title: newTopic }));
    setNewTopic('');
  };

  return (
    <Container>
      <Typography variant="h4">Community Interaction</Typography>
      <Paper>
        <TextField
          label="New Topic"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          fullWidth
        />
        <Button onClick={handleCreate} color="primary" variant="contained">
          Create Topic
        </Button>
      </Paper>
      <List>
        {topics.map((topic) => (
          <ListItem key={topic._id}>
            <Typography>{topic.title}</Typography>
            <Typography>Replies: {topic.replies.length}</Typography>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Community;