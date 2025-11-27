import Select from "../../ui/Select/Select.tsx";
import styles from "./styles.module.css";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contexts/AppContext.ts";

export default function ControlPanel({ data = [] }) {
    const { appState, setAppState } = useContext(AppContext);

    const variations = [
        { value: 1, label: "All variations selected" },
        ...data.variations.map(item => ({ value: item.id ? item.id : 0, label: item.name }))
    ];
    const timePeriods = [{ value: 0, label: "Day"}, { value: 1, label: "Week"}];
    const lineStyles = [
        { value: 0, label: "Line style: line" },
        { value: 1, label: "Line style: smooth" },
        { value: 2, label: "Line style: area" }
    ];

    const [variation, setVariation] = useState(variations[0]);
    const [timePeriod, setTimePeriod] = useState(timePeriods[0]);
    const [lineStyle, setLineStyle] = useState(lineStyles[0]);
    const [theme, setTheme] = useState(true);

    useEffect(() => {
        setAppState({ variation, timePeriod, lineStyle, theme });
    }, [variation, timePeriod, lineStyle, theme]);

    return (
        <div className={styles.controlPanel__wrap}>
            <div className={styles.controlPanel__col}>
                <Select
                    placeholder="Select variation"
                    options={variations}
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
                <button onClick={() => setTheme(!theme)}>Theme</button>
            </div>
        </div>
    )
}
