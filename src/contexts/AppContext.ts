import { createContext } from "react";
import type AppState from "../types/AppStateTypes.ts";

export const AppContext = createContext<{ appState: AppState | null, setAppState: (state) => void}>({
    appState: null,
    setAppState: (state) => {},
});
