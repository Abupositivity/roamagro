import api from '../../services/api';

export const fetchTopics = () => async (dispatch) => {
    try {
        const { data } = await api.get('/community');
        dispatch({
            type: 'FETCH_TOPICS_SUCCESS',
            payload: data.posts
        });
    } catch (err) {
        dispatch({
            type: 'FETCH_TOPICS_FAIL',
            payload: err.response?.data?.message
        });
    }
};

export const createTopic = (topic) => async (dispatch) => {
    try {
        const { data } = await api.post('/community', topic);
        dispatch({
            type: 'CREATE_TOPIC_SUCCESS',
            payload: data.post
        });
        console.log('✅ Topic created');
    } catch (err) {
        dispatch({
            type: 'CREATE_TOPIC_FAIL',
            payload: err.response?.data?.message
        });
    }
};