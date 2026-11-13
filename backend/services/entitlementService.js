const PLANS = Object.freeze({
    FREE: 'free',
    PREMIUM: 'premium',
});

const BILLING_CYCLES = Object.freeze({
    MONTHLY: 'monthly',
    ANNUAL: 'annual',
});

const FREE_LIMITS = Object.freeze({
    farmProjects: 3,
    marketplaceListings: 3,
});

const PREMIUM_PRICES = Object.freeze({
    monthly: 500,
    annual: 5000,
});

const isPremiumActive = (user, now = new Date()) => {
    if (!user || !user.subscription) {
        return false;
    }

    const {
        plan,
        startsAt,
        expiresAt,
    } = user.subscription;

    if (plan !== PLANS.PREMIUM) {
        return false;
    }

    if (!startsAt || !expiresAt) {
        return false;
    }

    const startDate = new Date(startsAt);
    const expiryDate = new Date(expiresAt);

    if (
        !Number.isFinite(startDate.getTime()) ||
        !Number.isFinite(expiryDate.getTime())
    ) {
        return false;
    }

    const currentTime = now.getTime();

    return (
        startDate.getTime() <= currentTime &&
        expiryDate.getTime() > currentTime
    );
};

const getEffectivePlan = (user, now = new Date()) => {
    return isPremiumActive(user, now)
        ? PLANS.PREMIUM
        : PLANS.FREE;
};

const getEntitlements = (user, now = new Date()) => {
    const premium = isPremiumActive(user, now);

    return {
        plan: premium
            ? PLANS.PREMIUM
            : PLANS.FREE,

        isPremium: premium,

        limits: {
            farmProjects: premium
                ? null
                : FREE_LIMITS.farmProjects,

            marketplaceListings: premium
                ? null
                : FREE_LIMITS.marketplaceListings,
        },

        features: {
            farmProjects: true,
            marketplace: true,
            priceIndex: true,
            community: true,
            agriFeed: true,

            financialDashboard: premium,
            financialReportExport: premium,

            adsEnabled: !premium,
        },

        subscription: {
            billingCycle: premium
                ? user.subscription.billingCycle
                : null,

            startsAt: premium
                ? user.subscription.startsAt
                : null,

            expiresAt: premium
                ? user.subscription.expiresAt
                : null,
        },
    };
};

const hasFeatureAccess = (
    user,
    feature,
    now = new Date()
) => {
    const entitlements = getEntitlements(user, now);

    return entitlements.features[feature] === true;
};

const getPlanPricing = () => {
    return {
        currency: 'NGN',

        free: {
            monthly: 0,
            annual: 0,
        },

        premium: {
            monthly: PREMIUM_PRICES.monthly,
            annual: PREMIUM_PRICES.annual,
        },
    };
};

module.exports = {
    PLANS,
    BILLING_CYCLES,
    FREE_LIMITS,
    PREMIUM_PRICES,
    isPremiumActive,
    getEffectivePlan,
    getEntitlements,
    hasFeatureAccess,
    getPlanPricing,
};