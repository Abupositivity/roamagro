import React from "react";

import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";

import { useTranslation } from "react-i18next";

const MarketComparison = ({
    prices = [],
}) => {
    const { t } = useTranslation();

    return (
        <Paper
            elevation={2}
            sx={{
                mt: 4,
                borderRadius: 3,
                overflow: "hidden",
                minWidth: 0,
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                    },
                }}
            >
                {t("Market Comparison")}
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    minWidth: 0,
                }}
            >
                <TableContainer
                    sx={{
                        maxWidth: "100%",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            minWidth: 520,
                            "& .MuiTableCell-root": {
                                px: {
                                    xs: 1.5,
                                    sm: 2,
                                },
                                py: 1.5,
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {t("Product")}
                                </TableCell>

                                <TableCell>
                                    {t("Market")}
                                </TableCell>

                                <TableCell>
                                    {t("Location")}
                                </TableCell>

                                <TableCell align="right">
                                    {t("Price")}
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {prices.map((price) => (
                                <TableRow
                                    key={price._id}
                                    hover
                                >
                                    <TableCell
                                        sx={{
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {price.product}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {price.market || "-"}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {price.location}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        sx={{
                                            whiteSpace: "nowrap",
                                            fontVariantNumeric:
                                                "tabular-nums",
                                        }}
                                    >
                                        ₦
                                        {Number(
                                            price.price
                                        ).toLocaleString("en-NG")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Paper>
    );
};

export default MarketComparison;