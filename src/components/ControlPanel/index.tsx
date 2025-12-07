import Select from "../../ui/Select/Select.tsx";
import type { Option } from "../../ui/Select/Select.ts";
import styles from "./styles.module.css";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext.ts";
import type { Variations } from "../../types/ChartTypes.ts";
import type AppState from "../../types/AppStateTypes.ts";

interface ControlPanelProps {
    variations?: Array<Variations>,
}

export default function ControlPanel({ variations = [] }: ControlPanelProps) {
    const { appState, setAppState } = useContext(AppContext);

    const optionsVariations = [
        { value: 1, label: "All variations selected" },
        ...variations?.map(item => ({ value: 'id' in item ? item.id : 0, label: item.name }))
    ];
    const timePeriods = [{ value: 0, label: "Day"}, { value: 1, label: "Week"}];
    const lineStyles = [
        { value: 0, label: "Line style: line" },
        { value: 1, label: "Line style: smooth" },
        { value: 2, label: "Line style: area" }
    ];

    const [variation, setVariation] = useState<Option>(optionsVariations[0]);
    const [timePeriod, setTimePeriod] = useState<Option>(timePeriods[0]);
    const [lineStyle, setLineStyle] = useState<Option>(lineStyles[0]);

    useEffect(() => {
        setAppState(state => state ? { ...state, variation, timePeriod, lineStyle } : null);
    }, [variation, timePeriod, lineStyle]);

    function toggleTheme() {
        const next = (appState as AppState)?.theme === "light" ? 'dark' : "light";
        setAppState(state => state ? { ...state, theme: next } : null);
        document.documentElement.setAttribute('data-theme', next);
    }

    async function exportSvgToPng() {
        const svgElement = document.querySelector("#chart");
        const svgData = new XMLSerializer().serializeToString(svgElement as Element);

        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise(resolve => {
            img.onload = resolve;
            img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = (svgElement as Element).clientWidth;
        canvas.height = (svgElement as Element).clientHeight;

        const ctx = canvas.getContext("2d");
        (ctx as CanvasRenderingContext2D).drawImage(img, 0, 0);

        URL.revokeObjectURL(url);

        const a = document.createElement("a");
        a.download = "chart.png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    }

    return (
        <div className={styles.controlPanel__wrap}>
            <div className={styles.controlPanel__col}>
                <Select
                    placeholder="Select variation"
                    options={optionsVariations}
                    value={variation}
                    onChange={setVariation}
                />
                <Select
                    placeholder="Select time period"
                    options={timePeriods}
                    value={timePeriod}
                    onChange={setTimePeriod}
                />
            </div>
            <div className={styles.controlPanel__col}>
                <Select
                    placeholder="Select line style"
                    options={lineStyles}
                    value={lineStyle}
                    onChange={setLineStyle}
                />
                <button className="button" onClick={toggleTheme}>Theme</button>
                <button className="button" onClick={exportSvgToPng}>PNG</button>
            </div>
        </div>
    )
}
