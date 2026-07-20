import React from 'react';
import { Box } from '@mui/material';
import PageContainer from '../common/PageContainer';

const PageLayout = ({ children }) => {
    return (
        <Box
            sx={{
                width: '100%',
                overflowX: 'hidden',
            }}
        >
            <PageContainer>

                {children}

            </PageContainer>
        </Box>
    );
};

export default PageLayout;