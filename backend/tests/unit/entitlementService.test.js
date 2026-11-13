const {
    PLANS,
    BILLING_CYCLES,
    FREE_LIMITS,
    PREMIUM_PRICES,
    isPremiumActive,
    getEffectivePlan,
    getEntitlements,
    hasFeatureAccess,
    getPlanPricing
} = require('../../services/entitlementService');

describe('Entitlement Service', () => {
    const now = new Date('2026-11-11T12:00:00.000Z');

    const freeUser = {
        role: 'farmer',
        subscription: {
            plan: PLANS.FREE,
            billingCycle: null,
            startsAt: null,
            expiresAt: null
        }
    };

    const premiumUser = {
        role: 'farmer',
        subscription: {
            plan: PLANS.PREMIUM,
            billingCycle: BILLING_CYCLES.MONTHLY,
            startsAt: new Date('2026-11-01T00:00:00.000Z'),
            expiresAt: new Date('2026-12-01T00:00:00.000Z')
        }
    };

    describe('Constants', () => {
        test('defines correct plan names', () => {
            expect(PLANS).toEqual({
                FREE: 'free',
                PREMIUM: 'premium'
            });
        });

        test('defines correct billing cycles', () => {
            expect(BILLING_CYCLES).toEqual({
                MONTHLY: 'monthly',
                ANNUAL: 'annual'
            });
        });

        test('limits Free users to three resources each', () => {
            expect(FREE_LIMITS).toEqual({
                farmProjects: 3,
                marketplaceListings: 3
            });
        });

        test('defines Premium prices in naira', () => {
            expect(PREMIUM_PRICES).toEqual({
                monthly: 500,
                annual: 5000
            });
        });
    });

    describe('isPremiumActive', () => {
        test('returns false for a missing user', () => {
            expect(isPremiumActive(null, now)).toBe(false);
        });

        test('returns false for missing subscription', () => {
            expect(isPremiumActive({}, now)).toBe(false);
        });

        test('returns false for a Free user', () => {
            expect(isPremiumActive(freeUser, now)).toBe(false);
        });

        test('returns true for active Premium', () => {
            expect(isPremiumActive(premiumUser, now)).toBe(true);
        });

        test('returns false before subscription starts', () => {
            const beforeStart = new Date(
                '2026-10-31T23:59:59.999Z'
            );

            expect(
                isPremiumActive(premiumUser, beforeStart)
            ).toBe(false);
        });

        test('returns true at the exact start time', () => {
            expect(
                isPremiumActive(
                    premiumUser,
                    premiumUser.subscription.startsAt
                )
            ).toBe(true);
        });

        test('returns false at the exact expiry time', () => {
            expect(
                isPremiumActive(
                    premiumUser,
                    premiumUser.subscription.expiresAt
                )
            ).toBe(false);
        });

        test('returns false after expiry', () => {
            const expiredTime = new Date(
                '2026-12-02T00:00:00.000Z'
            );

            expect(
                isPremiumActive(premiumUser, expiredTime)
            ).toBe(false);
        });

        test('returns false when dates are missing', () => {
            expect(
                isPremiumActive({
                    subscription: {
                        plan: PLANS.PREMIUM,
                        startsAt: null,
                        expiresAt: null
                    }
                }, now)
            ).toBe(false);
        });

        test('returns false for invalid dates', () => {
            expect(
                isPremiumActive({
                    subscription: {
                        plan: PLANS.PREMIUM,
                        startsAt: 'invalid',
                        expiresAt: 'invalid'
                    }
                }, now)
            ).toBe(false);
        });

        test('rejects a Premium plan with reversed dates', () => {
            expect(
                isPremiumActive({
                    subscription: {
                        plan: PLANS.PREMIUM,
                        startsAt: new Date('2026-12-01'),
                        expiresAt: new Date('2026-11-01')
                    }
                }, now)
            ).toBe(false);
        });
    });

    describe('getEffectivePlan', () => {
        test('returns Free for a Free user', () => {
            expect(
                getEffectivePlan(freeUser, now)
            ).toBe(PLANS.FREE);
        });

        test('returns Premium for an active subscriber', () => {
            expect(
                getEffectivePlan(premiumUser, now)
            ).toBe(PLANS.PREMIUM);
        });

        test('reverts expired Premium to Free', () => {
            const afterExpiry = new Date(
                '2026-12-02T00:00:00.000Z'
            );

            expect(
                getEffectivePlan(premiumUser, afterExpiry)
            ).toBe(PLANS.FREE);
        });
    });

    describe('getEntitlements', () => {
        test('returns correct Free limits and features', () => {
            const result = getEntitlements(freeUser, now);

            expect(result.plan).toBe('free');
            expect(result.isPremium).toBe(false);

            expect(result.limits).toEqual({
                farmProjects: 3,
                marketplaceListings: 3
            });

            expect(result.features).toMatchObject({
                farmProjects: true,
                marketplace: true,
                priceIndex: true,
                community: true,
                agriFeed: true,
                financialDashboard: false,
                financialReportExport: false,
                adsEnabled: true
            });
        });

        test('returns unlimited Premium quotas', () => {
            const result = getEntitlements(premiumUser, now);

            expect(result.plan).toBe('premium');
            expect(result.isPremium).toBe(true);

            expect(result.limits).toEqual({
                farmProjects: null,
                marketplaceListings: null
            });

            expect(result.features).toMatchObject({
                financialDashboard: true,
                financialReportExport: true,
                adsEnabled: false
            });
        });

        test('returns Premium subscription dates', () => {
            const result = getEntitlements(premiumUser, now);
            expect(result.plan).toBe(PLANS.PREMIUM);
            expect(result.subscription).toEqual({
                billingCycle: BILLING_CYCLES.MONTHLY,
                startsAt: premiumUser.subscription.startsAt,
                expiresAt: premiumUser.subscription.expiresAt
            });
        });

        test('removes Premium entitlements after expiry', () => {
            const afterExpiry = new Date(
                '2026-12-02T00:00:00.000Z'
            );

            const result = getEntitlements(
                premiumUser,
                afterExpiry
            );

            expect(result.plan).toBe('free');
            expect(result.limits.farmProjects).toBe(3);
            expect(result.limits.marketplaceListings).toBe(3);
            expect(result.features.financialDashboard).toBe(false);
            expect(result.features.financialReportExport).toBe(false);
            expect(result.features.adsEnabled).toBe(true);
            expect(result.subscription.expiresAt).toBeNull();
        });

        test.each([
            'admin',
            'extension_officer',
            'farmer',
            'buyer'
        ])(
            'does not grant automatic Premium to role %s',
            role => {
                const result = getEntitlements(
                    {
                        ...freeUser,
                        role
                    },
                    now
                );

                expect(result.isPremium).toBe(false);
                expect(result.limits.farmProjects).toBe(3);
            }
        );
    });

    describe('hasFeatureAccess', () => {
        test('allows Free users to access public features', () => {
            const features = [
                'farmProjects',
                'marketplace',
                'priceIndex',
                'community',
                'agriFeed'
            ];

            features.forEach(feature => {
                expect(
                    hasFeatureAccess(freeUser, feature, now)
                ).toBe(true);
            });
        });

        test('blocks Free users from financial features', () => {
            expect(
                hasFeatureAccess(
                    freeUser,
                    'financialDashboard',
                    now
                )
            ).toBe(false);

            expect(
                hasFeatureAccess(
                    freeUser,
                    'financialReportExport',
                    now
                )
            ).toBe(false);
        });

        test('allows Premium financial features', () => {
            expect(
                hasFeatureAccess(
                    premiumUser,
                    'financialDashboard',
                    now
                )
            ).toBe(true);

            expect(
                hasFeatureAccess(
                    premiumUser,
                    'financialReportExport',
                    now
                )
            ).toBe(true);
        });

        test('rejects unknown features', () => {
            expect(
                hasFeatureAccess(
                    premiumUser,
                    'unknownFeature',
                    now
                )
            ).toBe(false);
        });
    });

    describe('getPlanPricing', () => {
        test('returns correct currency and pricing', () => {
            expect(getPlanPricing()).toEqual({
                currency: 'NGN',
                free: {
                    monthly: 0,
                    annual: 0
                },
                premium: {
                    monthly: 500,
                    annual: 5000
                }
            });
        });
    });
});