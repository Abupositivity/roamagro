import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Box,
    Typography,
} from "@mui/material";

import { useTranslation } from "react-i18next";

import PremiumPromotion from "./PremiumPromotion";

const ADSENSE_ENABLED =
    process.env.REACT_APP_ADSENSE_ENABLED === "true";

const ADSENSE_CLIENT = (
    process.env.REACT_APP_ADSENSE_CLIENT || ""
).trim();

const PRICE_INDEX_SLOT = (
    process.env.REACT_APP_ADSENSE_PRICE_INDEX_SLOT || ""
).trim();

const SCRIPT_ID = "roamagro-adsense-script";

const SCRIPT_TIMEOUT_MS = 15000;

let scriptPromise = null;

const loadAdSenseScript = () => {
    if (scriptPromise) {
        return scriptPromise;
    }

    scriptPromise = new Promise((resolve, reject) => {
        let script = document.getElementById(SCRIPT_ID);

        if (script?.dataset.loaded === "true") {
            resolve();
            return;
        }

        if (script?.dataset.failed === "true") {
            script.remove();
            script = null;
        }

        const isNewScript = !script;

        if (isNewScript) {
            script = document.createElement("script");

            script.id = SCRIPT_ID;
            script.async = true;
            script.crossOrigin = "anonymous";

            script.src =
                "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" +
                `?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
        }

        let timeoutId;

        const cleanup = () => {
            clearTimeout(timeoutId);

            script.removeEventListener(
                "load",
                handleLoad
            );

            script.removeEventListener(
                "error",
                handleError
            );
        };

        const handleLoad = () => {
            cleanup();

            script.dataset.loaded = "true";

            resolve();
        };

        const handleError = () => {
            cleanup();

            script.dataset.failed = "true";
            script.remove();

            reject(
                new Error("AdSense script unavailable")
            );
        };

        script.addEventListener(
            "load",
            handleLoad,
            { once: true }
        );

        script.addEventListener(
            "error",
            handleError,
            { once: true }
        );

        timeoutId = setTimeout(
            handleError,
            SCRIPT_TIMEOUT_MS
        );

        if (isNewScript) {
            document.head.appendChild(script);
        }
    }).catch((error) => {
        scriptPromise = null;
        throw error;
    });

    return scriptPromise;
};

const GoogleAdSense = () => {
    const { t } = useTranslation();

    const adRef = useRef(null);
    const requestedRef = useRef(false);

    const [status, setStatus] = useState("loading");

    const configured =
        ADSENSE_ENABLED &&
        /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT) &&
        /^\d+$/.test(PRICE_INDEX_SLOT);

    useEffect(() => {
        if (!configured) {
            return undefined;
        }

        let cancelled = false;

        const adElement = adRef.current;

        if (!adElement) {
            return undefined;
        }

        const updateStatus = () => {
            if (cancelled) return;

            const adStatus = adElement.getAttribute(
                "data-ad-status"
            );

            if (
                adStatus === "filled" ||
                adStatus === "unfill-optimized"
            ) {
                setStatus("filled");
            } else if (adStatus === "unfilled") {
                setStatus("unfilled");
            }
        };

        let observer = null;

        if (typeof MutationObserver !== "undefined") {
            observer = new MutationObserver(
                updateStatus
            );

            observer.observe(adElement, {
                attributes: true,
                attributeFilter: ["data-ad-status"],
            });
        }

        updateStatus();

        const requestAdvertisement = async () => {
            try {
                await loadAdSenseScript();

                if (
                    cancelled ||
                    requestedRef.current ||
                    adRef.current !== adElement ||
                    !adElement.isConnected
                ) {
                    return;
                }

                requestedRef.current = true;

                window.adsbygoogle =
                    window.adsbygoogle || [];

                window.adsbygoogle.push({});
            } catch (error) {
                if (!cancelled) {
                    // AdSense failures must not
                    // interrupt Price Index.
                    setStatus("unavailable");
                }
            }
        };

        requestAdvertisement();

        return () => {
            cancelled = true;

            observer?.disconnect();
        };
    }, [configured]);

    if (!configured) {
        return <PremiumPromotion />;
    }

    const showFallback =
        status === "unfilled" ||
        status === "unavailable";

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {!showFallback && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: "block",
                        mb: 1,
                    }}
                >
                    {t("Advertisement")}
                </Typography>
            )}

            <Box
                sx={{
                    display: showFallback
                        ? "none"
                        : "block",

                    minHeight:
                        status === "loading"
                            ? 100
                            : 0,

                    width: "100%",
                }}
            >
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{
                        display: "block",
                        width: "100%",
                    }}
                    data-ad-client={ADSENSE_CLIENT}
                    data-ad-slot={PRICE_INDEX_SLOT}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </Box>

            {showFallback && (
                <PremiumPromotion />
            )}
        </Box>
    );
};

export default GoogleAdSense;