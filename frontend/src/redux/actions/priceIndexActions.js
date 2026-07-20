import api from '../../services/api';

import {
FETCH_PRICE_INDEX_REQUEST,
FETCH_PRICE_INDEX_SUCCESS,
FETCH_PRICE_INDEX_FAIL,
UPDATE_PRICE_INDEX_REQUEST,
UPDATE_PRICE_INDEX_SUCCESS,
UPDATE_PRICE_INDEX_FAIL,
}
from './types';

export const fetchPriceIndex=()=>async(dispatch)=>{
    dispatch({
        type:FETCH_PRICE_INDEX_REQUEST,
    });
    try{
        const res=await api.get('/price-index');
        dispatch({
            type:FETCH_PRICE_INDEX_SUCCESS,
            payload:res.data.data,
        });
    }
    catch(error){
        dispatch({
            type:FETCH_PRICE_INDEX_FAIL,
            payload:error.response?.data?.message,
        });
    }
};

export const updatePriceIndex=(price)=>async(dispatch)=>{
    dispatch({
        type:UPDATE_PRICE_INDEX_REQUEST,
    });
    try{
        const res=await api.post('/price-index',price);
        dispatch({
            type:UPDATE_PRICE_INDEX_SUCCESS,
            payload:res.data.data,
        });
        console.log("✅ Price Submitted");
    }
    catch(error){
        dispatch({
            type:UPDATE_PRICE_INDEX_FAIL,
            payload:error.response?.data?.message,
        });
    }
};