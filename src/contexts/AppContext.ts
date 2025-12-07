import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type AppState from "../types/AppStateTypes.ts";

export interface AppContextType {
    appState: AppState | null;
    setAppState: Dispatch<SetStateAction<AppState | null>>;
}

export const AppContext = createContext<AppContextType>({
    appState: null,
    setAppState: () => {},
});
