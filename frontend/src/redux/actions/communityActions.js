import axios from 'axios';

export const fetchTopics = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/community/topics');
    dispatch({ type: 'FETCH_TOPICS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_TOPICS_FAIL', payload: error.response.data });
  }
};

export const createTopic = (topicData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/community/topics', topicData);
    dispatch({ type: 'CREATE_TOPIC_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'CREATE_TOPIC_FAIL', payload: error.response.data });
  }
};

export const replyToTopic = (topicId, replyData) => async (dispatch) => {
  try {
    const response = await axios.post(`/api/community/topics/${topicId}/reply`, replyData);
    dispatch({ type: 'REPLY_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'REPLY_FAIL', payload: error.response.data });
  }
};