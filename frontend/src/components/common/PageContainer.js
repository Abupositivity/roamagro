import React from 'react';
import { Container } from '@mui/material';

const PageContainer = ({ children, maxWidth = 'lg' }) => {
    return (
        <Container
            maxWidth={maxWidth}
            sx={{
                pt: 3,
                pb: 12,
                px: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
                minHeight: '100%',
            }}
        >
            {children}
        </Container>
    );
};

export default PageContainer;