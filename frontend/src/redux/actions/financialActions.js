import financialService from '../../services/financialService';

import{
GET_FINANCIAL_DASHBOARD_REQUEST,
GET_FINANCIAL_DASHBOARD_SUCCESS,
GET_FINANCIAL_DASHBOARD_FAIL,
GET_EXPENSE_BREAKDOWN_REQUEST,
GET_EXPENSE_BREAKDOWN_SUCCESS,
GET_EXPENSE_BREAKDOWN_FAIL,
GET_PROJECT_PROFITABILITY_REQUEST,
GET_PROJECT_PROFITABILITY_SUCCESS,
GET_PROJECT_PROFITABILITY_FAIL,
GET_CASHFLOW_REQUEST,
GET_CASHFLOW_SUCCESS,
GET_CASHFLOW_FAIL
}from'../constants/financialConstants';

export const fetchFinancialDashboard=()=>async(dispatch)=>{
dispatch({
type:GET_FINANCIAL_DASHBOARD_REQUEST
});
try{
const res=await financialService.getDashboard();
dispatch({
type:GET_FINANCIAL_DASHBOARD_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:GET_FINANCIAL_DASHBOARD_FAIL,
payload:
error.response?.data?.message||
error.message||
'Unable to load financial dashboard.'
});
}
};

export const fetchExpenseBreakdown=()=>async(dispatch)=>{
dispatch({
type:GET_EXPENSE_BREAKDOWN_REQUEST
});
try{
const res=await financialService.getExpenseBreakdown();
dispatch({
type:GET_EXPENSE_BREAKDOWN_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:GET_EXPENSE_BREAKDOWN_FAIL,
payload:
error.response?.data?.message||
error.message||
'Unable to load expense breakdown.'
});
}
};

export const fetchProjectProfitability=()=>async(dispatch)=>{
dispatch({
type:GET_PROJECT_PROFITABILITY_REQUEST
});
try{
const res=await financialService.getProjectProfitability();
dispatch({
type:GET_PROJECT_PROFITABILITY_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:GET_PROJECT_PROFITABILITY_FAIL,
payload:error.response?.data?.message
});
}
};

export const fetchCashFlow=()=>async(dispatch)=>{
dispatch({
type:GET_CASHFLOW_REQUEST
});
try{
const res=await financialService.getMonthlyCashFlow();
dispatch({
type:GET_CASHFLOW_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:GET_CASHFLOW_FAIL,
payload:error.response?.data?.message
});
}
};