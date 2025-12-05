export default interface ChartInterface {
    variations: Array<Variations>,
    data: Array<Item>,
}

export type Variations = { name: string } | { id: number, name: string };

interface Item {
    date: string,
    visits: Visits,
    conversions: Conversions,
}

type Visits = Record<string, number>;

type Conversions = Record<string, number>;
