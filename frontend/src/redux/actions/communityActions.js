import axios from 'axios';

export const fetchTopics = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/community'); // Updated endpoint
    dispatch({ type: 'FETCH_TOPICS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_TOPICS_FAIL', payload: error.response?.data || 'Failed to fetch topics' });
  }
};

export const createTopic = (topicData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/community', topicData); // Updated endpoint
    dispatch({ type: 'CREATE_TOPIC_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'CREATE_TOPIC_FAIL', payload: error.response?.data || 'Failed to create topic' });
  }
};

export const replyToTopic = (topicId, replyData) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/community/${topicId}/reply`, replyData); // Updated endpoint
    dispatch({ type: 'REPLY_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'REPLY_FAIL', payload: error.response?.data || 'Failed to post reply' });
  }
};