import React from 'react';
import {Button} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {useTranslation} from 'react-i18next';

const ExportFinancialReport=({
dashboard,
expenseBreakdown,
projectProfitability,
cashFlow
})=>{

const{t}=useTranslation();

const exportCSV=()=>{

const rows=[];

/* Dashboard */
rows.push(['FINANCIAL SUMMARY']);
rows.push([]);
rows.push(['Total Income',dashboard?.totalIncome||0]);
rows.push(['Total Expenses',dashboard?.totalExpenses||0]);
rows.push(['Total Profit',dashboard?.totalProfit||0]);
rows.push([]);
rows.push(['PROJECT PROFITABILITY']);
(projectProfitability||[]).forEach(project=>{
rows.push([
project.name,
project.income,
project.expenses,
project.profit
]);
});
rows.push([]);
rows.push(['EXPENSE BREAKDOWN']);
(expenseBreakdown?.categories||[]).forEach(item=>{
rows.push([
item.category,
item.amount
]);
});
rows.push([]);
rows.push(['MONTHLY CASH FLOW']);
(cashFlow||[]).forEach(month=>{
rows.push([
month.month,
month.income,
month.expenses,
month.profit
]);
});
const csv=rows
.map(row=>row.join(','))
.join('\n');
const blob=new Blob(
[csv],
{
type:'text/csv;charset=utf-8;'
}
);
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download='roamagro-financial-report.csv';
link.click();
URL.revokeObjectURL(url);
};
return(
<Button
variant="contained"
startIcon={<DownloadIcon/>}
onClick={exportCSV}
>
{t('Export Report')}
</Button>
);
};

export default ExportFinancialReport;