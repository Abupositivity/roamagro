import React from "react";

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PITCH_TEMPLATE_URL =
    `${process.env.PUBLIC_URL || ""}` +
    "/documents/roamagro-advertiser-pitch.docx";

const ADVERTISING_PACKAGES = [
    {
        name: "Starter",
        price: "₦5,000",
        duration: "7 days",
        description:
            "Suitable for small businesses, short-term promotions and first-time advertisers.",
    },
    {
        name: "Growth",
        price: "₦15,000",
        duration: "30 days",
        description:
            "Suitable for businesses seeking sustained monthly advertising.",
    },
    {
        name: "Regional",
        price: "₦30,000",
        duration: "30 days",
        description:
            "Intended for larger regional campaigns with individually agreed coverage.",
    },
    {
        name: "Custom",
        price: "Negotiable",
        duration: "Flexible",
        description:
            "Customized campaigns based on agreed duration, placement and targeting.",
    },
];

const ADVERTISING_GUIDELINES = [
    {
        title: "Advertising Structure",
        items: [
            "Direct agricultural advertisements are displayed on the User Dashboard and Extension Officer Dashboard.",
            "Google AdSense advertisements are reserved for Price Index.",
            "Farm Projects, Marketplace, AgriFeed and Community remain advertisement-free.",
            "Premium subscribers do not receive advertisements.",
            "Administrators must not promise exclusive placement unless a separate supported arrangement has been approved.",
        ],
    },
    {
        title: "Eligible Advertisers",
        items: [
            "Seed and fertilizer suppliers.",
            "Agricultural equipment manufacturers and dealers.",
            "Registered agrochemical suppliers.",
            "Animal feed and veterinary businesses.",
            "Agricultural cooperatives and associations.",
            "Produce buyers and processing companies.",
            "Agricultural logistics businesses.",
            "Legitimate agricultural financing and insurance providers.",
            "Agricultural research and training institutions.",
            "Government and NGO agricultural programmes.",
        ],
    },
    {
        title: "Advertisement Requirements",
        items: [
            "Advertisement title must not exceed 150 characters.",
            "Advertisement description must not exceed 1,000 characters.",
            "Advertiser name must not exceed 150 characters.",
            "Advertisements must contain a clear and relevant promotional image.",
            "Recommended image dimensions: 1200 × 628 pixels.",
            "Recommended image formats: JPG, PNG and WebP.",
            "Destination URLs must use HTTPS.",
            "Advertisement images should remain readable on mobile devices.",
            "All claims and promotional information must be accurate and lawful.",
        ],
    },
    {
        title: "Campaign Targeting",
        items: [
            "Advertisements may target one or multiple Nigerian states.",
            "Leaving target states empty makes a campaign eligible across all supported locations.",
            "Targeting uses registered user location information, not live GPS tracking.",
            "Each campaign must have an agreed advertisement placement.",
            "Separate campaigns may be required when advertising across multiple placements.",
        ],
    },
    {
        title: "Advertisement Rotation and Capacity",
        items: [
            "RoamAgro rotates eligible advertisements within supported placements.",
            "Eligibility depends on campaign status, dates, placement, state targeting and subscription entitlements.",
            "Administrators should aim to maintain fewer than five potentially competing campaigns within overlapping placements, audiences and campaign periods.",
            "Capacity warnings are advisory and do not automatically prevent campaign activation.",
            "Consider alternative dates, placements or targeting when capacity warnings appear.",
            "Campaigns are sold by duration, not guaranteed impressions or clicks.",
        ],
    },
    {
        title: "Payments and Billing",
        items: [
            "Confirm the advertiser's requirements before providing a quotation.",
            "Agree on the package, price, placement, targeting and campaign duration.",
            "Provide official RoamAgro payment instructions.",
            "Direct advertising payments are currently confirmed manually.",
            "Verify actual payment receipt before marking a campaign as paid.",
            "Record the agreed package and amount in the campaign billing section.",
            "Activate the campaign only after payment and content approval.",
            "Never request banking passwords, PINs or one-time passwords.",
        ],
    },
    {
        title: "Campaign Management",
        items: [
            "Draft: A campaign that has been created but is not enabled for display.",
            "Scheduled: An enabled campaign whose start date has not arrived.",
            "Active: An enabled campaign within its approved advertising period.",
            "Paused: A campaign temporarily disabled by an administrator.",
            "Expired: A campaign whose advertising period has ended.",
            "Review payment information, advertisement content, dates, targeting and placement before activating a campaign.",
            "Pause advertisements that violate platform policies or require investigation.",
        ],
    },
    {
        title: "Advertiser Performance Reporting",
        items: [
            "Advertisers may receive a private, read-only performance report.",
            "Reports include campaign details, billing information, impressions, clicks, CTR and effective cost per click.",
            "An impression is recorded when at least 50% of an eligible advertisement becomes visible, subject to a one-hour per-user deduplication window.",
            "Clicks have a separate one-hour per-user deduplication window.",
            "Click-through rate (CTR) equals recorded clicks divided by recorded impressions, multiplied by 100.",
            "Effective cost per click equals the paid campaign amount divided by recorded clicks.",
            "Metrics are approximate and do not represent guaranteed sales or unique customers.",
            "Deduplication uses server memory and may reset when the server restarts.",
        ],
    },
    {
        title: "Advertiser Report Privacy",
        items: [
            "Generate a private report link for the advertiser.",
            "Share report links only with authorized recipients.",
            "Regenerating a report link invalidates the previous link.",
            "Revoke report access when necessary.",
            "Never disclose personal farmer or user information to advertisers.",
        ],
    },
    {
        title: "Advertisement Content Policy",
        items: [
            "Reject fraudulent investments and financial scams.",
            "Reject illegal or counterfeit agricultural products.",
            "Reject prohibited or unregistered agricultural chemicals.",
            "Reject misleading product, financial or health claims.",
            "Reject gambling, tobacco and recreational drug advertisements.",
            "Reject weapons and illegal products.",
            "Reject discriminatory, offensive or sexually explicit content.",
            "Reject political campaigning.",
            "Reject unauthorized use of intellectual property or organization identities.",
            "RoamAgro reserves the right to reject, pause or remove advertisements that violate applicable laws or approved platform policies.",
        ],
    },
    {
        title: "Cancellation and Refunds",
        items: [
            "Cancellation and refund terms should be agreed in writing before campaign activation.",
            "Cancellation before activation may qualify for a refund under the agreed terms.",
            "Cancellation after activation should be assessed individually.",
            "Campaign extensions or credits may be considered for significant RoamAgro service interruptions.",
            "Low impressions, clicks or sales do not automatically qualify for refunds.",
            "All refund decisions must be documented and approved by an authorized administrator.",
        ],
    },
    {
        title: "Google AdSense Management",
        items: [
            "Google AdSense is reserved for Price Index.",
            "Automatic advertisements must remain disabled.",
            "Premium subscribers must remain advertisement-free.",
            "Administrators must not click live advertisements for testing.",
            "Never encourage artificial advertisement impressions or clicks.",
            "Ensure publisher information and ads.txt remain accurate.",
            "Follow Google advertising and applicable privacy policies.",
            "When AdSense is unavailable or disabled, eligible free users may receive the RoamAgro Premium promotion instead.",
            "AdMob and Google Play Billing are deferred until native Android distribution is introduced.",
        ],
    },
    {
        title: "Administrator Responsibilities",
        items: [
            "Maintain accurate campaign and billing records.",
            "Review advertisement content before activation.",
            "Monitor campaign dates, status and capacity.",
            "Communicate accurate information to advertisers.",
            "Protect private advertiser report links.",
            "Do not invent audience statistics or guarantee advertising results.",
            "Maintain user trust and protect the reputation of RoamAgro.",
        ],
    },
];

const PITCH_STEPS = [
    "Identify agricultural businesses that may benefit from advertising.",
    "Introduce RoamAgro and explain its agricultural focus.",
    "Understand the advertiser's product, audience, budget and objectives.",
    "Recommend a suitable advertising package.",
    "Confirm placement, target states, campaign duration and availability.",
    "Prepare and send a customized advertising proposal.",
    "Confirm payment and collect approved promotional materials.",
    "Activate the campaign and provide a private performance report link.",
    "Follow up with the advertiser after the campaign ends.",
];

const AdminAdvertisingGuide = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Stack spacing={3}>
            {/* Page navigation */}

            <Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() =>
                        navigate("/admin/dashboard")
                    }
                >
                    {t("Back to Admin Dashboard")}
                </Button>
            </Box>

            {/* Page heading */}

            <Card
                elevation={0}
                sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderRadius: 3,
                }}
            >
                <CardContent>
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                    >
                        <MenuBookOutlinedIcon
                            sx={{ fontSize: 40 }}
                        />

                        <Box>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                component="h1"
                            >
                                {t("Advertising Guide")}
                            </Typography>

                            <Typography variant="body2">
                                {t(
                                    "RoamAgro advertising resource centre"
                                )}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Overview */}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {t("Overview")}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t(
                                "RoamAgro helps agricultural businesses promote relevant products and services to farmers, buyers and agricultural professionals."
                            )}
                        </Typography>

                        <Typography variant="body2">
                            {t(
                                "Our advertising system prioritizes relevant promotions, sustainable revenue and a simple user experience."
                            )}
                        </Typography>

                        <Alert severity="info">
                            {t(
                                "Premium subscribers remain advertisement-free. Direct advertising campaigns do not guarantee impressions, clicks or sales."
                            )}
                        </Alert>

                        <Box>
                            <Button
                                variant="contained"
                                startIcon={
                                    <CampaignOutlinedIcon />
                                }
                                onClick={() =>
                                    navigate(
                                        "/admin/advertisements"
                                    )
                                }
                            >
                                {t("Manage Advertisements")}
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Advertising packages */}

            <Box>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                >
                    {t("Advertising Packages")}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                >
                    {t(
                        "Recommended introductory packages for direct agricultural advertising."
                    )}
                </Typography>

                <Grid container spacing={2}>
                    {ADVERTISING_PACKAGES.map(
                        (advertisingPackage) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                lg={3}
                                key={
                                    advertisingPackage.name
                                }
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                {t(
                                                    advertisingPackage.name
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                color="primary"
                                                fontWeight={800}
                                            >
                                                {t(
                                                    advertisingPackage.price
                                                )}
                                            </Typography>

                                            <Box>
                                                <Chip
                                                    size="small"
                                                    label={t(
                                                        advertisingPackage.duration
                                                    )}
                                                />
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {t(
                                                    advertisingPackage.description
                                                )}
                                            </Typography>

                                            <Divider />

                                            <Typography
                                                variant="body2"
                                            >
                                                ✓{" "}
                                                {t(
                                                    "Dashboard advertising"
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                            >
                                                ✓{" "}
                                                {t(
                                                    "State targeting"
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                            >
                                                ✓{" "}
                                                {t(
                                                    "Private performance report"
                                                )}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    )}
                </Grid>

                <Alert
                    severity="info"
                    sx={{ mt: 2 }}
                >
                    {t(
                        "Pricing is introductory and subject to management approval. Confirm campaign coverage and availability before providing a quotation."
                    )}
                </Alert>
            </Box>

            {/* Advertiser pitch resources */}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                        >
                            <DescriptionOutlinedIcon
                                color="primary"
                                sx={{ fontSize: 36 }}
                            />

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {t(
                                        "Advertiser Pitch Template"
                                    )}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        "Sales guidelines and editable advertising proposal."
                                    )}
                                </Typography>
                            </Box>
                        </Stack>

                        <Typography variant="body2">
                            {t(
                                "Use this document when approaching agricultural businesses and preparing advertising proposals."
                            )}
                        </Typography>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                        >
                            <Button
                                component="a"
                                href={PITCH_TEMPLATE_URL}
                                download="roamagro-advertiser-pitch.docx"
                                variant="contained"
                                startIcon={
                                    <DownloadOutlinedIcon />
                                }
                            >
                                {t(
                                    "Download Pitch Template"
                                )}
                            </Button>

                            <Chip
                                label={t(
                                    "Editable Word Document"
                                )}
                                variant="outlined"
                            />
                        </Stack>

                        <Alert severity="info">
                            {t(
                                "Customize the proposal with the advertiser's name, campaign details, agreed pricing and official contact information before sending it."
                            )}
                        </Alert>
                    </Stack>
                </CardContent>
            </Card>

            {/* Sales workflow */}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {t(
                                "Advertiser Acquisition Steps"
                            )}
                        </Typography>

                        {PITCH_STEPS.map(
                            (step, index) => (
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="flex-start"
                                    key={step}
                                >
                                    <Box
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            flexShrink: 0,
                                            borderRadius:
                                                "50%",
                                            bgcolor:
                                                "primary.main",
                                            color:
                                                "primary.contrastText",
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            fontSize: 13,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {index + 1}
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        sx={{ pt: 0.5 }}
                                    >
                                        {t(step)}
                                    </Typography>
                                </Stack>
                            )
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Advertising guidelines */}

            <Box>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                >
                    {t("Administration Guidelines")}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                >
                    {t(
                        "Review these guidelines when creating, approving and managing advertising campaigns."
                    )}
                </Typography>

                <Stack spacing={1}>
                    {ADVERTISING_GUIDELINES.map(
                        ({ title, items }) => (
                            <Accordion
                                key={title}
                                disableGutters
                                elevation={0}
                                sx={{
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius:
                                        "8px !important",
                                    overflow: "hidden",

                                    "&:before": {
                                        display: "none",
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        <ExpandMoreIcon />
                                    }
                                >
                                    <Typography
                                        fontWeight={600}
                                    >
                                        {t(title)}
                                    </Typography>
                                </AccordionSummary>

                                <AccordionDetails>
                                    <Stack
                                        component="ul"
                                        spacing={1.5}
                                        sx={{
                                            mt: 0,
                                            mb: 1,
                                            pl: 3,
                                        }}
                                    >
                                        {items.map(
                                            (item) => (
                                                <Typography
                                                    key={item}
                                                    component="li"
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {t(item)}
                                                </Typography>
                                            )
                                        )}
                                    </Stack>
                                </AccordionDetails>
                            </Accordion>
                        )
                    )}
                </Stack>
            </Box>

            {/* Policy notice */}

            <Alert severity="warning">
                {t(
                    "These guidelines are intended for internal administration. Commercial pricing, advertising acceptance and refund policies must be approved by management."
                )}
            </Alert>

            {/* Footer */}

            <Box
                sx={{
                    py: 3,
                    textAlign: "center",
                }}
            >
                <Divider sx={{ mb: 3 }} />

                <Typography
                    fontWeight={700}
                    color="primary"
                >
                    {t("RoamAgro")}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {t(
                        "Your Agribusiness Companion"
                    )}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {t(
                        "Internal Advertising Administration Guide"
                    )}
                </Typography>
            </Box>
        </Stack>
    );
};

export default AdminAdvertisingGuide;