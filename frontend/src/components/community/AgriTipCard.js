import React from 'react';

import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Stack,
    Typography,
} from '@mui/material';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { useTranslation } from 'react-i18next';

const AgriTipCard = ({
    tip,
}) => {

    const { t } = useTranslation();

    const priorityColor = () => {

        switch (tip.priority) {

            case 'Urgent':
                return 'error';

            case 'Important':
                return 'warning';

            default:
                return 'success';

        }

    };

    return (

        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
            }}
        >

            {tip.image && (

                <CardMedia
                    component="img"
                    height="220"
                    image={tip.image}
                    alt={tip.title}
                />

            )}

            <CardContent>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                    mb={2}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        {tip.title}
                    </Typography>

                    <Chip
                        label={tip.priority}
                        color={priorityColor()}
                        size="small"
                        icon={<PriorityHighIcon />}
                    />

                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    mb={2}
                >

                    <Chip
                        icon={<AgricultureIcon />}
                        label={tip.category}
                        size="small"
                        color="success"
                        variant="outlined"
                    />

                    <Chip
                        icon={<LanguageIcon />}
                        label={tip.language}
                        size="small"
                        variant="outlined"
                    />

                    <Chip
                        icon={<LocationOnIcon />}
                        label={tip.region}
                        size="small"
                        variant="outlined"
                    />

                </Stack>

                <Typography
                    variant="body1"
                    sx={{
                        whiteSpace: 'pre-line',
                    }}
                >
                    {tip.content}
                </Typography>

                <Box mt={3}>

                    {tip.createdBy?.name && (

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            <strong>
                                {t('Shared by')}:
                            </strong>{' '}
                            {tip.createdBy.name}
                        </Typography>

                    )}

                    {tip.source && (

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            <strong>
                                {t('Source')}:
                            </strong>{' '}
                            {tip.source}
                        </Typography>

                    )}

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={1}
                    >
                        {new Date(
                            tip.createdAt
                        ).toLocaleDateString()}
                    </Typography>

                </Box>

            </CardContent>

        </Card>

    );

};

export default AgriTipCard;