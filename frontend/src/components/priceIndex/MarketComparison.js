import React from 'react';
import {
Paper,
Typography,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const MarketComparison = ({
    prices = [],
}) => {

    const { t } = useTranslation();

    return (
        <TableContainer
            component={Paper}
            sx={{ mt: 4 }}
        >
            <Typography
                variant="h6"
                sx={{ p: 2 }}
            >
                {t('Market Comparison')}
            </Typography>

            <Table size="small">

                <TableHead>

                    <TableRow>

                        <TableCell>
                            {t('Product')}
                        </TableCell>

                        <TableCell>
                            {t('Market')}
                        </TableCell>

                        <TableCell>
                            {t('Location')}
                        </TableCell>

                        <TableCell align="right">
                            {t('Price')}
                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {prices.map((price) => (

                        <TableRow
                            key={price._id}
                        >

                            <TableCell>
                                {price.product}
                            </TableCell>

                            <TableCell>
                                {price.market || '-'}
                            </TableCell>

                            <TableCell>
                                {price.location}
                            </TableCell>

                            <TableCell align="right">
                                ₦
                                {Number(
                                    price.price
                                ).toLocaleString()}
                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>
    );
};

export default MarketComparison;