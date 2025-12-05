import { useState } from "react";
import { AppContext } from "../contexts/AppContext.ts";
import type AppState from "../types/AppStateTypes.ts";

export function AppProvider({ children }) {
    const [appState, setAppState] = useState<AppState | null>({
        variation: { value: 1, label: "All variations selected" },
        timePeriod: { value: 0, label: "Day"},
        lineStyle: { value: 0, label: "Line style: line" },
        theme: "light",
    });

    return (
        <AppContext.Provider value={{ appState, setAppState }}>
            {children}
        </AppContext.Provider>
    );
}
