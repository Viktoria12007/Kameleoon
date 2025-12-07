import Chart from "./components/Chart";
import ControlPanel from "./components/ControlPanel";
import { AppProvider } from "./providers/AppProvider.tsx";
import { useEffect, useState } from "react";
import type ChartInterface from "./types/ChartTypes.ts";
import Loader from "./ui/Loader/Loader.tsx";

function App() {
    const [data, setData] = useState<ChartInterface | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        fetch("/data.json")
            .then(res => res.json())
            .then(json => setData(json))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AppProvider>
            { loading && <Loader/> }
            { data && <>
                        <ControlPanel variations={data.variations}/>
                        <Chart data={data}/>
                    </>
            }
        </AppProvider>
    )
}

export default App
