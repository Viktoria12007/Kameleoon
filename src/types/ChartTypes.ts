export default interface ChartInterface {
    variations: Array<Variations>,
    data: Array<ItemData>,
}

export type Variations = { name: string } | { id: number, name: string };

export interface ItemData {
    date: string,
    visits: Visits,
    conversions: Conversions,
}

type Visits = Record<string, number>;

type Conversions = Record<string, number>;
