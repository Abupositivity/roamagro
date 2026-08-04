import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ExpenseBreakdown = ({
    data,
    loading = false,
    error = null
}) => {

    const { t } = useTranslation();

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                py={4}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    if (!data || !data.categories?.length) {
        return (
            <Alert severity="info">
                {t('No expense data available yet.')}
            </Alert>
        );
    }

    return (
        <Card>
            <CardContent>

                <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={3}
                >
                    {t('Expense Breakdown')}
                </Typography>

                <Stack spacing={2}>

                    {data.categories.map(item => (
                        <Stack
                            key={item.category}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography>
                                {item.category}
                            </Typography>

                            <Typography
                                fontWeight={600}
                            >
                                ₦{item.amount.toLocaleString()}
                            </Typography>
                        </Stack>
                    ))}

                    <Divider />

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Typography fontWeight={700}>
                            {t('Total Expenses')}
                        </Typography>

                        <Typography
                            fontWeight={700}
                            color="error.main"
                        >
                            ₦{data.totalExpenses.toLocaleString()}
                        </Typography>
                    </Stack>

                </Stack>

            </CardContent>
        </Card>
    );
};

export default ExpenseBreakdown;