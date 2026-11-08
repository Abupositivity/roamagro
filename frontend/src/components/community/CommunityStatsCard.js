import React from "react";

import {
    Card,
    CardContent,
    Typography,
    Stack,
} from "@mui/material";

const CommunityStatsCard = ({
    title,
    value,
    icon,
}) => {
    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                height: "100%",
                minWidth: 0,
            }}
        >
            <CardContent
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                    },
                    "&:last-child": {
                        pb: {
                            xs: 1.5,
                            sm: 2,
                        },
                    },
                }}
            >
                <Stack
                    spacing={{
                        xs: 0.75,
                        sm: 1,
                    }}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        minHeight: {
                            xs: 90,
                            sm: 110,
                        },
                        minWidth: 0,
                    }}
                >
                    {icon}

                    <Typography
                        fontWeight={700}
                        align="center"
                        sx={{
                            fontSize: {
                                xs: "1.35rem",
                                sm: "1.75rem",
                                md: "2rem",
                            },
                            lineHeight: 1.2,
                            overflowWrap: "anywhere",
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {value}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{
                            fontSize: {
                                xs: "0.75rem",
                                sm: "0.875rem",
                            },
                            lineHeight: 1.4,
                            overflowWrap: "anywhere",
                        }}
                    >
                        {title}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default React.memo(CommunityStatsCard);