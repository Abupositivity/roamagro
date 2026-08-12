import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
} from '@mui/material';

const CommunityStatsCard = ({
    title,
    value,
    icon,
    //color = 'primary.main',
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

                <Stack
                    spacing={1}
                    alignItems="center"
                    >

                    {icon}

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >

                    {value}

                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >

                    {title}

                    </Typography>

                </Stack>

            </CardContent>

        </Card>

    );

};

export default CommunityStatsCard;