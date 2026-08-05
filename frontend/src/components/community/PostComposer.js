import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    TextField,
    Button,
    MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const categories = [
    'Crop Production',
    'Livestock',
    'Poultry',
    'Soil Health',
    'Pest Control',
    'Diseases',
    'Climate',
    'Weather',
    'Market Prices',
    'Government Support',
    'Mechanization',
    'Agribusiness',
    'Finance',
    'Technology',
    'General',
];

const PostComposer = ({
    formData,
    loading,
    onChange,
    onSubmit,
}) => {

    const { t } = useTranslation();

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius:3,
                mb:4,
            }}
        >
            <CardContent>

                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {t('Share with the Community')}
                </Typography>

                <Stack
                    spacing={2}
                >

                    <TextField
                        fullWidth
                        label={t('Title')}
                        name="title"
                        value={formData.title}
                        onChange={onChange}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={t('What would you like to share?')}
                        name="content"
                        value={formData.content}
                        onChange={onChange}
                    />

                    <TextField
                        select
                        fullWidth
                        label={t('Category')}
                        name="category"
                        value={formData.category}
                        onChange={onChange}
                    >
                        {categories.map(category=>(
                            <MenuItem
                                key={category}
                                value={category}
                            >
                                {t(category)}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        label={t('Image URL (optional)')}
                        name="image"
                        value={formData.image || ''}
                        onChange={onChange}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        onClick={onSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? t('Posting...')
                            : t('Post')}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PostComposer;