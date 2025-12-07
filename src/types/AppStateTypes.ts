import type { Option } from "../ui/Select/Select.tsx";

export default interface AppState {
    variation: Option,
    timePeriod: Option,
    lineStyle: Option,
    theme: "light" | "dark",
}
