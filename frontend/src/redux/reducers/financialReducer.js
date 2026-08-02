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

const initialState={
dashboard:null,
expenseBreakdown:null,
projectProfitability:[],
cashFlow:[],
loading:{
dashboard:false,
expenses:false,
profitability:false,
cashFlow:false
},
error:{
dashboard:null,
expenses:null,
profitability:null,
cashFlow:null
}
};
const financialReducer=(state=initialState,action)=>{
switch(action.type){

/* Dashboard */
case GET_FINANCIAL_DASHBOARD_REQUEST:
return{
...state,
loading:{
...state.loading,
dashboard:true
},
error:{
...state.error,
dashboard:null
}
};
case GET_FINANCIAL_DASHBOARD_SUCCESS:
return{
...state,
dashboard:action.payload,
loading:{
...state.loading,
dashboard:false
}
};
case GET_FINANCIAL_DASHBOARD_FAIL:
return{
...state,
loading:{
...state.loading,
dashboard:false
},
error:{
...state.error,
dashboard:action.payload
}
};

/* Expense Breakdown */
case GET_EXPENSE_BREAKDOWN_REQUEST:
return{
...state,
loading:{
...state.loading,
expenses:true
},
error:{
...state.error,
expenses:null
}
};
case GET_EXPENSE_BREAKDOWN_SUCCESS:
return{
...state,
expenseBreakdown:action.payload,
loading:{
...state.loading,
expenses:false
}
};
case GET_EXPENSE_BREAKDOWN_FAIL:
return{
...state,
loading:{
...state.loading,
expenses:false
},
error:{
...state.error,
expenses:action.payload
}
};

/* Project Profitability */
case GET_PROJECT_PROFITABILITY_REQUEST:
return{
...state,
loading:{
...state.loading,
profitability:true
},
error:{
...state.error,
profitability:null
}
};
case GET_PROJECT_PROFITABILITY_SUCCESS:
return{
...state,
projectProfitability:action.payload,
loading:{
...state.loading,
profitability:false
}
};
case GET_PROJECT_PROFITABILITY_FAIL:
return{
...state,
loading:{
...state.loading,
profitability:false
},
error:{
...state.error,
profitability:action.payload
}
};
/* Cash Flow */
case GET_CASHFLOW_REQUEST:
return{
...state,
loading:{
...state.loading,
cashFlow:true
},
error:{
...state.error,
cashFlow:null
}
};
case GET_CASHFLOW_SUCCESS:
return{
...state,
cashFlow:action.payload,
loading:{
...state.loading,
cashFlow:false
}
};
case GET_CASHFLOW_FAIL:
return{
...state,
loading:{
...state.loading,
cashFlow:false
},
error:{
...state.error,
cashFlow:action.payload
}
};
default:
return state;
}
};

export default financialReducer;