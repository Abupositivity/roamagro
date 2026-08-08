import React from 'react';

import {
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useTranslation } from 'react-i18next';

const ExpenseCard = ({
    expense,
    loading = false,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation();

    return (
        <Card
            sx={{
                borderRadius: 3,
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Stack spacing={1}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {expense.category}
                        </Typography>

                        <Chip
                            label={`₦${Number(
                                expense.amount || 0
                            ).toLocaleString()}`}
                            color="error"
                            size="small"
                        />

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {expense.date
                                ? new Date(
                                      expense.date
                                  ).toLocaleDateString()
                                : t(
                                      'No date'
                                  )}
                        </Typography>
                    </Stack>

                    <Stack direction="row">
                        <IconButton
                            size="small"
                            disabled={loading}
                            onClick={() =>
                                onEdit?.(
                                    expense
                                )
                            }
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            color="error"
                            disabled={loading}
                            onClick={() =>
                                onDelete?.(
                                    expense
                                )
                            }
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ExpenseCard;