export const getPriceTrend = (prices = [], product) => {

    const productPrices = prices
        .filter(item => item.product === product)
        .sort(
            (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
        );

    if (productPrices.length < 2) {
        return 'stable';
    }

    const previous =
        Number(
            productPrices[
                productPrices.length - 2
            ].price
        );

    const latest =
        Number(
            productPrices[
                productPrices.length - 1
            ].price
        );

    if (latest > previous) {
        return 'rising';
    }

    if (latest < previous) {
        return 'falling';
    }

    return 'stable';

};