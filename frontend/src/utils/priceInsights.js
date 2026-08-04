export const generatePriceInsights = (prices = []) => {

    if (!prices.length) {
        return [];
    }

    const insights = [];

    const grouped = {};

    prices.forEach(price => {

        if (!grouped[price.product]) {
            grouped[price.product] = [];
        }

        grouped[price.product].push(price);

    });

    Object.entries(grouped).forEach(([product, records]) => {

        if (records.length < 2) {
            return;
        }

        const sorted = [...records].sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

        const cheapest = sorted[0];
        const expensive =
            sorted[sorted.length - 1];

        insights.push({

            product,

            cheapest,

            expensive,

            difference:
                expensive.price -
                cheapest.price,

        });

    });

    return insights;

};