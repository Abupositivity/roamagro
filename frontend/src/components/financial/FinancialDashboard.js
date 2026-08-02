import React,{useEffect}from'react';
import{useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';

import{
Container,
Typography,
Box,
CircularProgress,
Alert
}from'@mui/material';

import{
fetchFinancialDashboard,
fetchExpenseBreakdown,
fetchProjectProfitability,
fetchCashFlow
}from'../../redux/actions/financialActions';

import FinancialSummaryCards from'./FinancialSummaryCards';
import ExpenseBreakdown from'./ExpenseBreakdown';
import ProjectProfitability from'./ProjectProfitability';
import CashFlowList from'./CashFlowList';
import ExportFinancialReport from'./ExportFinancialReport';

const FinancialDashboard=()=>{
const{t}=useTranslation();
const dispatch=useDispatch();

const{

dashboard,
expenseBreakdown,
projectProfitability,
cashFlow,
loading,
error

}=useSelector(state=>state.financial);

useEffect(()=>{
dispatch(fetchFinancialDashboard());
dispatch(fetchExpenseBreakdown());
dispatch(fetchProjectProfitability());
dispatch(fetchCashFlow());
},[dispatch]);
return(
<Container
maxWidth="xl"
sx={{
py:3,
pb:10
}}
>
<Box
display="flex"
justifyContent="space-between"
alignItems={{
xs:'flex-start',
md:'center'
}}
flexDirection={{
xs:'column',
md:'row'
}}
gap={2}
mb={4}
>
<Box>
<Typography
variant="h4"
fontWeight={700}
>
{t('Financial Dashboard')}
</Typography>
<Typography
variant="body1"
color="text.secondary"
>
{t('Track your farm income, expenses and profits.')}
</Typography>
</Box>
<ExportFinancialReport
disabled={loading.dashboard}
dashboard={dashboard}
expenseBreakdown={expenseBreakdown}
projectProfitability={projectProfitability}
cashFlow={cashFlow}
/>
</Box>
{/* ================= Dashboard Summary ================= */}
{loading.dashboard?(
<Box
display="flex"
justifyContent="center"
py={6}
>
<CircularProgress/>
</Box>
):error.dashboard?(
<Alert
severity="error"
sx={{mb:5}}
>
{error.dashboard}
</Alert>
):(
<Box mb={5}>
<FinancialSummaryCards
dashboard={dashboard}
/>
</Box>
)}

{/* ================= Expense Breakdown ================= */}
<Box mb={5}>
<ExpenseBreakdown
loading={loading.expenses}
error={error.expenses}
data={expenseBreakdown}
/>
</Box>

{/* ================= Project Profitability ================= */}
<Box mb={5}>
<ProjectProfitability
loading={loading.profitability}
error={error.profitability}
projects={projectProfitability}
/>
</Box>

{/* ================= Monthly Cash Flow ================= */}
<Box mb={2}>
<CashFlowList
loading={loading.cashFlow}
error={error.cashFlow}
cashFlow={cashFlow}
/>
</Box>
</Container>
);
};

export default FinancialDashboard;