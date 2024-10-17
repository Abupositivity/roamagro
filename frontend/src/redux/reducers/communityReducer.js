const initialState = {
    topics: [],
    error: null,
  };
  
  const communityReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_TOPICS_SUCCESS':
        return { ...state, topics: action.payload };
      case 'FETCH_TOPICS_FAIL':
        return { ...state, error: action.payload };
      case 'CREATE_TOPIC_SUCCESS':
        return { ...state, topics: [...state.topics, action.payload] };
      case 'CREATE_TOPIC_FAIL':
        return { ...state, error: action.payload };
      case 'REPLY_SUCCESS':
        return {
          ...state,
          topics: state.topics.map((topic) =>
            topic._id === action.payload.topicId
              ? { ...topic, replies: [...topic.replies, action.payload.reply] }
              : topic
          ),
        };
      case 'REPLY_FAIL':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };
  
  export default communityReducer;