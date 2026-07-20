import api from '../../services/api';

import {

FETCH_TOPICS_REQUEST,
FETCH_TOPICS_SUCCESS,
FETCH_TOPICS_FAIL,

CREATE_TOPIC_REQUEST,
CREATE_TOPIC_SUCCESS,
CREATE_TOPIC_FAIL,

} from './types';

export const fetchTopics=()=>async(dispatch)=>{

dispatch({

type:FETCH_TOPICS_REQUEST,

});

try{

const res=await api.get('/community');

dispatch({

type:FETCH_TOPICS_SUCCESS,

payload:res.data.data,

});

}

catch(error){

dispatch({

type:FETCH_TOPICS_FAIL,

payload:error.response?.data?.message,

});

}

};

export const createTopic=(topic)=>async(dispatch)=>{

dispatch({

type:CREATE_TOPIC_REQUEST,

});

try{

const res=await api.post('/community',topic);

dispatch({

type:CREATE_TOPIC_SUCCESS,

payload:res.data.data,

});

console.log("✅ Topic Created");

}

catch(error){

dispatch({

type:CREATE_TOPIC_FAIL,

payload:error.response?.data?.message,

});

}

};