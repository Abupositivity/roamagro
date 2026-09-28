import React from 'react';
import{Button,Stack}from'@mui/material';
import DownloadIcon from'@mui/icons-material/Download';
import PictureAsPdfIcon from'@mui/icons-material/PictureAsPdf';
import {useTranslation}from'react-i18next';
import jsPDF from'jspdf';

const ExportFinancialReport=({
    dashboard,
    expenseBreakdown,
    projectProfitability,
    cashFlow,
    disabled=false
})=>{
    const{t}=useTranslation();

    const formatNumber=value=>{
        const number=Number(value)||0;
        return number.toLocaleString('en-NG',{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        });
    };

    const escapeCSV=value=>{
        const text=String(value??'');
        return `"${text.replace(/"/g,'""')}"`;
    };

    const exportCSV=()=>{
        const rows=[];

        rows.push(['FINANCIAL SUMMARY']);
        rows.push([]);
        rows.push(['Total Income',dashboard?.totalIncome||0]);
        rows.push(['Total Expenses',dashboard?.totalExpenses||0]);
        rows.push(['Total Profit',dashboard?.totalProfit||0]);
        rows.push([]);

        rows.push([
            'PROJECT PROFITABILITY'
        ]);
        rows.push([
            'Project',
            'Income',
            'Expenses',
            'Profit'
        ]);

        (projectProfitability||[]).forEach(project=>{
            rows.push([
                project.name||'',
                project.income||0,
                project.expenses||0,
                project.profit||0
            ]);
        });

        rows.push([]);
        rows.push(['EXPENSE BREAKDOWN']);
        rows.push(['Category','Amount']);

        (expenseBreakdown?.categories||[]).forEach(item=>{
            rows.push([
                item.category||'',
                item.amount||0
            ]);
        });

        rows.push([]);
        rows.push(['MONTHLY CASH FLOW']);
        rows.push([
            'Month',
            'Income',
            'Expenses',
            'Profit'
        ]);

        (cashFlow||[]).forEach(month=>{
            rows.push([
                month.month||'',
                month.income||0,
                month.expenses||0,
                month.profit||0
            ]);
        });

        const csv=rows
            .map(row=>row.map(escapeCSV).join(','))
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

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const exportPDF=()=>{
        const doc=new jsPDF({
            orientation:'portrait',
            unit:'mm',
            format:'a4'
        });

        const pageWidth=doc.internal.pageSize.getWidth();
        const pageHeight=doc.internal.pageSize.getHeight();

        let y=20;

        const ensureSpace=(height=10)=>{
            if(y+height>pageHeight-18){
                doc.addPage();
                y=20;
            }
        };

        const addTitle=title=>{
            ensureSpace(12);

            doc.setFontSize(14);
            doc.setFont('helvetica','bold');
            doc.text(title,15,y);

            y+=8;
        };

        const addRow=(label,value)=>{
            ensureSpace(8);

            doc.setFontSize(10);
            doc.setFont('helvetica','normal');

            doc.text(
                String(label),
                15,
                y
            );

            doc.text(
                String(value),
                pageWidth-15,
                y,
                {
                    align:'right'
                }
            );

            y+=6;
        };

        const addTableHeader=(columns,widths)=>{
            ensureSpace(10);

            doc.setFontSize(9);
            doc.setFont('helvetica','bold');

            let x=15;

            columns.forEach((column,index)=>{
                doc.text(
                    String(column),
                    x,
                    y
                );

                x+=widths[index];
            });

            y+=6;

            doc.setLineWidth(.2);
            doc.line(
                15,
                y-3,
                pageWidth-15,
                y-3
            );
        };

        const addTableRow=(values,widths)=>{
            ensureSpace(8);

            doc.setFontSize(9);
            doc.setFont('helvetica','normal');

            let x=15;

            values.forEach((value,index)=>{
                const text=String(value??'');

                doc.text(
                    text.length>32
                        ? `${text.slice(0,29)}...`
                        : text,
                    x,
                    y
                );

                x+=widths[index];
            });

            y+=6;
        };

        doc.setFontSize(20);
        doc.setFont('helvetica','bold');
        doc.text(
            'RoamAgro',
            15,
            y
        );

        y+=9;

        doc.setFontSize(16);
        doc.text(
            t('Financial Report'),
            15,
            y
        );

        y+=7;

        doc.setFontSize(9);
        doc.setFont('helvetica','normal');
        doc.text(
            `Generated: ${new Date().toLocaleString('en-NG')}`,
            15,
            y
        );

        y+=12;

        doc.setLineWidth(.5);
        doc.line(
            15,
            y,
            pageWidth-15,
            y
        );

        y+=10;

        addTitle(t('Financial Summary'));

        addRow(
            t('Total Income'),
            `NGN ${formatNumber(dashboard?.totalIncome)}`
        );

        addRow(
            t('Total Expenses'),
            `NGN ${formatNumber(dashboard?.totalExpenses)}`
        );

        addRow(
            t('Total Profit'),
            `NGN ${formatNumber(dashboard?.totalProfit)}`
        );

        y+=5;

        addTitle(t('Project Profitability'));

        const projectWidths=[
            75,
            35,
            35,
            30
        ];

        addTableHeader(
            [
                t('Project'),
                t('Income'),
                t('Expenses'),
                t('Profit')
            ],
            projectWidths
        );

        if(
            !projectProfitability||
            projectProfitability.length===0
        ){
            addTableRow(
                [t('No project data available.')],
                [175]
            );
        }else{
            projectProfitability.forEach(project=>{
                addTableRow(
                    [
                        project.name||'',
                        `NGN ${formatNumber(project.income)}`,
                        `NGN ${formatNumber(project.expenses)}`,
                        `NGN ${formatNumber(project.profit)}`
                    ],
                    projectWidths
                );
            });
        }

        y+=5;

        addTitle(t('Expense Breakdown'));

        const expenseWidths=[
            120,
            55
        ];

        addTableHeader(
            [
                t('Category'),
                t('Amount')
            ],
            expenseWidths
        );

        const categories=
            expenseBreakdown?.categories||[];

        if(categories.length===0){
            addTableRow(
                [t('No expense data available.')],
                [175]
            );
        }else{
            categories.forEach(item=>{
                addTableRow(
                    [
                        item.category||'',
                        `NGN ${formatNumber(item.amount)}`
                    ],
                    expenseWidths
                );
            });
        }

        y+=5;

        addTitle(t('Monthly Cash Flow'));

        const cashFlowWidths=[
            55,
            40,
            40,
            40
        ];

        addTableHeader(
            [
                t('Month'),
                t('Income'),
                t('Expenses'),
                t('Profit')
            ],
            cashFlowWidths
        );

        if(!cashFlow||cashFlow.length===0){
            addTableRow(
                [t('No cash flow data available.')],
                [175]
            );
        }else{
            cashFlow.forEach(month=>{
                addTableRow(
                    [
                        month.month||'',
                        `NGN ${formatNumber(month.income)}`,
                        `NGN ${formatNumber(month.expenses)}`,
                        `NGN ${formatNumber(month.profit)}`
                    ],
                    cashFlowWidths
                );
            });
        }

        const totalPages=
            doc.internal.getNumberOfPages();

        for(
            let page=1;
            page<=totalPages;
            page++
        ){
            doc.setPage(page);

            doc.setFontSize(8);
            doc.setFont('helvetica','normal');

            doc.text(
                `RoamAgro Financial Report • ${page}/${totalPages}`,
                pageWidth/2,
                pageHeight-8,
                {
                    align:'center'
                }
            );
        }

        doc.save(
            'roamagro-financial-report.pdf'
        );
    };

    return(
        <Stack
            direction={{
                xs:'column',
                sm:'row'
            }}
            spacing={1}
            width={{
                xs:'100%',
                sm:'auto'
            }}
        >
            <Button
                variant="outlined"
                startIcon={
                    <DownloadIcon/>
                }
                onClick={exportCSV}
                disabled={disabled}
                sx={{
                    borderRadius:2.5
                }}
            >
                {t('Export CSV')}
            </Button>

            <Button
                variant="contained"
                startIcon={
                    <PictureAsPdfIcon/>
                }
                onClick={exportPDF}
                disabled={disabled}
                sx={{
                    borderRadius:2.5
                }}
            >
                {t('Export PDF')}
            </Button>
        </Stack>
    );
};

export default ExportFinancialReport;