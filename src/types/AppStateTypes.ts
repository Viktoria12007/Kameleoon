export default interface AppState {
    variation: { value: number, label: string },
    timePeriod: { value: number, label: string },
    lineStyle: { value: number, label: string },
    theme: "light" | "dark",
}
