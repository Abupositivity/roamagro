import React, { useMemo } from "react";
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    Stack,
    Chip,
    Button,
} from "@mui/material";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getStatusColor = status => {
    switch (status) {
        case "Completed":
            return "success";
        case "Active":
            return "primary";
        case "Paused":
            return "warning";
        case "Planning":
            return "info";
        default:
            return "default";
    }
};

const RecentProjects = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const projects = useSelector(
        state => state.farmProjects.projects || []
    );

    const recentProjects = useMemo(
        () => projects.slice(0, 3),
        [projects]
    );

    return (
        <Box>
            <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
            >
                {t("Recent Projects")}
            </Typography>

            {recentProjects.length === 0 ? (
                <Paper
                    sx={{
                        p: 3,
                        textAlign: "center",
                        borderRadius: 3
                    }}
                >
                    <AgricultureIcon
                        color="success"
                        sx={{ fontSize: 50 }}
                    />

                    <Typography mt={2}>
                        {t("No farm projects yet")}
                    </Typography>

                    <Button
                        sx={{ mt: 2 }}
                        variant="contained"
                        onClick={() => navigate("/farm-projects")}
                    >
                        {t("Create Project")}
                    </Button>
                </Paper>
            ) : (
                recentProjects.map(project => {
                    const progress = Math.min(
                        100,
                        Math.max(
                            0,
                            Number(project.progress) || 0
                        )
                    );

                    const status = project.status || "Planning";

                    return (
                        <Paper
                            key={project._id}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 3
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={2}
                            >
                                <Typography
                                    fontWeight={700}
                                >
                                    {project.name}
                                </Typography>

                                <Chip
                                    size="small"
                                    label={t(status)}
                                    color={getStatusColor(status)}
                                />
                            </Stack>

                            {project.description && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={1}
                                >
                                    {project.description}
                                </Typography>
                            )}

                            <LinearProgress
                                sx={{ mt: 2 }}
                                variant="determinate"
                                value={progress}
                            />
                        </Paper>
                    );
                })
            )}
        </Box>
    );
};

export default React.memo(RecentProjects);