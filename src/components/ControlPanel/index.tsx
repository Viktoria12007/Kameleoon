import Select from "../../ui/Select/Select.tsx";
import styles from "./styles.module.css";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext.ts";
import type { Variations } from "../../types/ChartTypes.ts";

interface ControlPanelProps {
    variations?: Array<Variations>,
}

export default function ControlPanel({ variations = [] }: ControlPanelProps) {
    const { appState, setAppState } = useContext(AppContext);

    const optionsVariations = [
        { value: 1, label: "All variations selected" },
        ...variations.map(item => ({ value: item.id ? item.id : 0, label: item.name }))
    ];
    const timePeriods = [{ value: 0, label: "Day"}, { value: 1, label: "Week"}];
    const lineStyles = [
        { value: 0, label: "Line style: line" },
        { value: 1, label: "Line style: smooth" },
        { value: 2, label: "Line style: area" }
    ];

    const [variation, setVariation] = useState(optionsVariations[0]);
    const [timePeriod, setTimePeriod] = useState(timePeriods[0]);
    const [lineStyle, setLineStyle] = useState(lineStyles[0]);

    useEffect(() => {
        setAppState((state) => ({ ...state, variation, timePeriod, lineStyle }));
    }, [variation, timePeriod, lineStyle]);

    function toggleTheme() {
        const next = appState?.theme === "light" ? 'dark' : "light";
        setAppState((state) => ({ ...state, theme: next }));
        document.documentElement.setAttribute('data-theme', next);
    }

    async function exportSvgToPng() {
        const svgElement = document.querySelector("#chart");
        const svgData = new XMLSerializer().serializeToString(svgElement as Node);

        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise(resolve => {
            img.onload = resolve;
            img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = svgElement.clientWidth;
        canvas.height = svgElement.clientHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

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
