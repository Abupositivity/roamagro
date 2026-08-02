const FarmProject=require('../models/FarmProject');
const asyncHandler=require('../middleware/asyncHandler');

/*
|--------------------------------------------------------------------------
| Financial Dashboard
|--------------------------------------------------------------------------
*/
exports.getFinancialDashboard=asyncHandler(async(req,res)=>{
const projects=await FarmProject.find({
user:req.user._id
});
let totalIncome=0;
let totalExpenses=0;
let activeProjects=0;
let completedProjects=0;
let planningProjects=0;
projects.forEach(project=>{
const income=(project.harvests||[]).reduce(
(sum,item)=>sum+(item.totalValue||0),
0
);
const expenses=(project.expenses||[]).reduce(
(sum,item)=>sum+(item.amount||0),
0
);
totalIncome+=income;
totalExpenses+=expenses;
switch(project.status){
case'Planning':
planningProjects++;
break;
case'Active':
activeProjects++;
break;
case'Completed':
completedProjects++;
break;
default:
break;
}
});
res.status(200).json({
success:true,
data:{
totalIncome,
totalExpenses,
totalProfit:totalIncome-totalExpenses,
totalProjects:projects.length,
planningProjects,
activeProjects,
completedProjects
}
});
});

exports.getExpenseBreakdown=asyncHandler(async(req,res)=>{
const projects=await FarmProject.find({
user:req.user._id
});
const categories={};
let totalExpenses=0;
projects.forEach(project=>{
(project.expenses||[]).forEach(expense=>{
const category=expense.category||'Other';
categories[category]=(categories[category]||0)+
(expense.amount||0);
totalExpenses+=expense.amount||0;
});
});
const breakdown=Object.entries(categories)
.map(([category,amount])=>({
category,
amount
}))
.sort((a,b)=>b.amount-a.amount);
res.status(200).json({
success:true,
data:{
totalExpenses,
categories:breakdown
}
});
});

exports.getProjectProfitability=asyncHandler(async(req,res)=>{
const projects=await FarmProject.find({
user:req.user._id
});
const summary=projects.map(project=>{
const income=(project.harvests||[]).reduce(
(sum,item)=>sum+(item.totalValue||0),
0
);
const expenses=(project.expenses||[]).reduce(
(sum,item)=>sum+(item.amount||0),
0
);
return{
_id:project._id,
name:project.name,
status:project.status,
income,
expenses,
profit:income-expenses
};
});
res.status(200).json({
success:true,
count:summary.length,
data:summary
});
});

exports.getMonthlyCashFlow=asyncHandler(async(req,res)=>{
const projects=await FarmProject.find({
user:req.user._id
});
const months={};
projects.forEach(project=>{
(project.harvests||[]).forEach(harvest=>{
if(!harvest.harvestDate)return;
const key=new Date(harvest.harvestDate)
.toLocaleString('default',{
month:'long',
year:'numeric'
});
if(!months[key]){
months[key]={
income:0,
expenses:0
};
}
months[key].income+=harvest.totalValue||0;
});
(project.expenses||[]).forEach(expense=>{
if(!expense.date)return;
const key=new Date(expense.date)
.toLocaleString('default',{
month:'long',
year:'numeric'
});
if(!months[key]){
months[key]={
income:0,
expenses:0
};
}
months[key].expenses+=expense.amount||0;
});
});
const data=Object.entries(months).map(
([month,values])=>({
month,
income:values.income,
expenses:values.expenses,
profit:values.income-values.expenses
})
);
res.status(200).json({
success:true,
data
});
});