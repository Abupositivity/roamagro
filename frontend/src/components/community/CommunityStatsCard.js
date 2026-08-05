import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
} from '@mui/material';

const CommunityStatsCard = ({
    title,
    value,
    icon,
    color = 'primary.main',
}) => {

    return (

        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                height: '100%',
            }}
        >

            <CardContent>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                >

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {title}
                    </Typography>

                    <Box
                        sx={{
                            color,
                        }}
                    >
                        {icon}
                    </Box>

                </Box>

                <Typography
                    variant="h4"
                    fontWeight={700}
                >
                    {value}
                </Typography>

            </CardContent>

        </Card>

    );

};

export default CommunityStatsCard;