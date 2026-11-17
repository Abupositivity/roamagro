
import React from "react";
import { useSelector } from "react-redux";

import GoogleAdSense from "./GoogleAdSense";

const ExternalAdPlacement = ({
    placement = "price-index",
}) => {
    const isAuthenticated = useSelector(
        (state) => state.auth.isAuthenticated
    );

    const {
        data: subscription,
        loaded,
        loading,
        error,
    } = useSelector(
        (state) => state.subscription
    );

    const adsEnabled =
        isAuthenticated &&
        loaded &&
        !loading &&
        !error &&
        subscription?.features?.adsEnabled === true;

    if (
        !adsEnabled ||
        placement !== "price-index"
    ) {
        return null;
    }

    return <GoogleAdSense />;
};

export default ExternalAdPlacement;