
import React from "react";
import { Box } from "@mui/material";
import TopAppBar from "./TopAppBar";
import FixedBottomNavigation from "./FixedBottomNavigation";

const APPBAR_HEIGHT = {
    xs: 56,
    sm: 64
};

const BOTTOM_NAV_HEIGHT = 72;

const PageLayout = ({ children }) => {
    return (
        <Box
            sx={{
                minHeight: "100dvh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
                color: "text.primary",
                overflowX: "clip"
            }}
        >
            <TopAppBar />

            <Box
                component="main"
                sx={{
                    flex: "1 0 auto",
                    width: "100%",
                    minWidth: 0,
                    pt: {
                        xs: `${APPBAR_HEIGHT.xs + 12}px`,
                        sm: `${APPBAR_HEIGHT.sm + 16}px`
                    },
                    px: {
                        xs: 1.5,
                        sm: 2,
                        md: 3
                    },
                    pb: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 16px)`,
                    overflowWrap: "anywhere",
                    "& img, & video, & canvas": {
                        maxWidth: "100%"
                    },
                    "& table": {
                        maxWidth: "100%"
                    }
                }}
            >
                {children}
            </Box>

            <FixedBottomNavigation />
        </Box>
    );
};

export default PageLayout;