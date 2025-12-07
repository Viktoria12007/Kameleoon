import * as d3 from "d3";
import type ChartInterface from "../../types/ChartTypes.ts";
import type { ItemData } from "../../types/ChartTypes.ts";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../contexts/AppContext.ts";
import styles from "./styles.module.css";
import type { Area } from "d3";
import type { MouseEvent } from "react";

interface ChartProps {
    data: ChartInterface,
    width?: number,
    height?: number,
}

interface Point {
    date: Date,
    value: number,
}
type ChartParsed = Array<Array<Point>>;

interface VariationsColors {
    [key: string]: {
        light: string,
        dark: string,
    };
}

const Chart = ({ data, width = 1300, height = 330 }: ChartProps) => {
    const { appState } = useContext(AppContext);

    const [widthContainer, setWidthContainer] = useState(width);
    const [dateTooltip, setDateTooltip] = useState<Date | null>(null);
    const [valuesTooltip, setValuesTooltip] = useState<Array<number>>([]);

    const gx = useRef<SVGGElement | null>(null);
    const gy = useRef<SVGGElement | null>(null);
    const tooltip = useRef<HTMLDivElement | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const verticalLine = useRef<SVGLineElement | null>(null);

    useEffect(() => {
        function render() {
            if (container.current) {
                setWidthContainer(container.current.getBoundingClientRect().width);
            }
        }
        window.addEventListener('resize', render);
        render();
        return () => window.removeEventListener('resize', render);
    }, []);

    const marginBottom = 30;
    const marginLeft = 40;
    const marginRight = 20;
    const marginTop = 20;
    const formatDate = d3.timeFormat("%d.%m.%Y");
    const bisect = d3.bisector((d: Point) => d.date).left;

    let parsed: ChartParsed;
    const light = ["#46464F", "#4142EF", "#FF8346", "#35BDAD"];
    const dark = ["#C7C5D0", "#A1A3FF", "#FF8346", "#35BDAD"];
    const variationsColors = data.variations.reduce((acc: VariationsColors, item, index) => {
        acc['id' in item ? item.id : 0] = {
            light: light[index],
            dark: dark[index],
        };
        return acc;
    }, {});

    if (appState?.timePeriod.value === 0) {
        if (appState?.variation.value === 1) {
            parsed = data.variations.map(item => data.data.map(d => ({
                date: new Date(d.date),
                value: conversionRate(d, item),
            })).sort(sortItemsChartParsed));
        } else {
            parsed = [data.data.map(d => ({
                date: new Date(d.date),
                value: conversionRate(d),
            })).sort(sortItemsChartParsed)];
        }
    } else {
        if (appState?.variation.value === 1) {
            parsed = data.variations.map(item => groupByWeek(data.data, item).sort(sortItemsChartParsed));
        } else {
            parsed = [groupByWeek(data.data).sort(sortItemsChartParsed)];
        }
    }

    const parsedFlat = parsed.flat();

    const x = d3.scaleTime().domain(d3.extent(parsedFlat, d => d.date) as [Date, Date]).range([marginLeft, widthContainer - marginRight]);
    const y = d3.scaleLinear().domain(d3.extent(parsedFlat, d => d.value) as [number, number]).range([height - marginBottom, marginTop]);

    let line = d3.line<Point>().defined(d => !isNaN(d.value)).x((d) => x(d.date)).y((d) => y(d.value));
    let area: Area<Point>;
    if (appState?.lineStyle.value === 1) {
        line = line.curve(d3.curveMonotoneX);
    } else if (appState?.lineStyle.value === 2) {
        line = line.curve(d3.curveMonotoneX);
        area = d3.area<Point>().defined(d => !isNaN(d.value)).x((d) => x(d.date)).y0(y(d3.min(parsedFlat, (d) => d.value) as number))
            .y1((d) => y(d.value)).curve(d3.curveMonotoneX);
    }

    useEffect(() => {
        let axis;
        if (appState?.timePeriod.value === 0) {
            axis = d3.select<SVGGElement, unknown>(gx.current as SVGGElement).call(d3.axisBottom<Date>(x).tickFormat(formatDate));
        } else {
            axis = d3.select<SVGGElement, unknown>(gx.current as SVGGElement).call(d3.axisBottom<Date>(x).ticks(parsedFlat.length)
                .tickValues(parsedFlat.map(d => d.date)).tickFormat(formatDate));
        }
        axis.call(g => g.selectAll(".tick line").remove())
        .call(g => g.selectAll(".domain").remove())
    }, [gx, x, appState?.timePeriod.value]);
    useEffect(() => {
        d3.select<SVGGElement, unknown>(gy.current as SVGGElement).call(d3.axisLeft<number>(y).ticks(4).tickFormat((domainValue) => `${domainValue}%`))
                .call(g => g.selectAll(".tick line").remove())
                .call(g => g.selectAll(".domain").remove())
    }, [gy, y]);

    function sortItemsChartParsed(a: Point, b: Point) {
        return a.date.getTime() - b.date.getTime();
    }

    function conversionRate(item: ItemData, variationSelected = data.variations[0]) {
        if (!appState) return NaN;
        if (appState.variation.value === 1) {
            const variationSelectedId = 'id' in variationSelected ? variationSelected.id : 0;
            return (item.conversions[variationSelectedId] / item.visits[variationSelectedId]) * 100;
        }
        return (item.conversions[appState.variation.value] / item.visits[appState.variation.value]) * 100;
    }

    function handleMouseOut() {
        if (tooltip.current) {
            tooltip.current.style.display = 'none';
        }
    }

    function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
        if (tooltip.current) {
            const date = x.invert(d3.pointer(event)[0]);
            setDateTooltip(date);
            const valuesPerDate = parsed.map(line => {
                const i = bisect(line, date);
                return line[i].value;
            });
            setValuesTooltip(valuesPerDate);
            tooltip.current.style.display = 'block';
            const centerY = marginTop + marginBottom + (height / 2);
            tooltip.current.style.transform = `translate(${x(date)}px,${-centerY}px)`;
            verticalLine.current?.setAttribute("transform", `translate(${x(date)},0)`);
        }
    }

    function groupByWeek(startData: Array<ItemData>, variationSelected = data.variations[0]): Array<Point> {
        const weeks = d3.groups(
            startData,
            d => d3.timeMonday(new Date(d.date))
        );
        return weeks.map(([weekStart, items]) => ({
            date: weekStart,
            value: sumConversionRate(items, variationSelected),
        }));
    }

    function sumConversionRate(items: Array<ItemData>, variationSelected = data.variations[0]) {
        if (!appState) return NaN;
        if (appState.variation.value === 1) {
            const variationSelectedId = 'id' in variationSelected ? variationSelected.id : 0;
            return d3.sum(items, (d) => checkIsNaN(d.conversions[variationSelectedId])) /
                d3.sum(items, (d) => checkIsNaN(d.visits[variationSelectedId])) * 100;
        }
        return d3.sum(items, (d) => checkIsNaN(d.conversions[appState.variation.value])) /
            d3.sum(items, (d) => checkIsNaN(d.visits[appState.variation.value])) * 100;
    }

    function checkIsNaN(value: number) {
        return isNaN(value) ? 0 : value;
    }

    return (
        <div ref={container} style={{ position: 'relative', width: '100%' }}>
            <svg
                id="chart"
                style={{ width: '100%', height }}
                onMouseEnter={handleMouseMove}
                onMouseLeave={handleMouseOut}
                onMouseMove={handleMouseMove}
            >
                { !!parsed.length && appState &&
                    <>
                        <g ref={gx} transform={`translate(-5,${height - marginBottom})`} className={styles.axisText} />
                        <g ref={gy} transform={`translate(${marginLeft},0)`} className={styles.axisText} />
                        <g>
                            { x.ticks().map((d, i) =>
                                (<line
                                    key={i}
                                    x1={0.5 + x(d)}
                                    x2={0.5 + x(d)}
                                    y1={marginTop}
                                    y2={height - marginBottom}
                                    className={styles.axisLines}
                                    strokeDasharray={'6'}
                                />)) }
                            { y.ticks().map((d, i) =>
                                (<line
                                    key={i}
                                    x1={marginLeft}
                                    x2={widthContainer - marginRight}
                                    y1={0.5 + y(d)}
                                    y2={0.5 + y(d)}
                                    className={styles.axisLines}
                                />)) }
                        </g>
                        { parsed.map((p, index) =>
                            <g key={index}>
                                <path
                                    fill="none"
                                    stroke="transparent"
                                    strokeWidth="2"
                                    d={line(p.filter(d => !isNaN(d.value))) ?? undefined}
                                />
                                <path
                                    fill="none"
                                    stroke={appState.variation.value !== 1 ?
                                        variationsColors[appState.variation.value][appState.theme]
                                        : Object.values(variationsColors)[index][appState.theme]}
                                    strokeWidth="2"
                                    d={line(p) ?? undefined}
                                />
                                { appState.lineStyle.value === 2 &&
                                    <>
                                        <path
                                            fill="transparent"
                                            fillOpacity="0.2"
                                            stroke="none"
                                            d={area(p.filter(d => !isNaN(d.value))) ?? undefined}
                                        />
                                        <path
                                            fill={appState.variation.value !== 1 ?
                                                variationsColors[appState.variation.value][appState.theme]
                                                : Object.values(variationsColors)[index][appState.theme]}
                                            fillOpacity="0.2"
                                            stroke="none"
                                            d={area(p) ?? undefined}
                                        />
                                    </>
                                }
                            </g>
                        )}
                        <line ref={verticalLine} y1={height - marginBottom} y2={0} className={styles.cursorTooltip} />
                    </>
                }
            </svg>
            { !!parsed.length && appState && <div ref={tooltip} className={styles.tooltip}>
                                    <div className={styles.dateTooltip}>
                                        {formatDate(dateTooltip as Date)}
                                    </div>
                                    <ul className={styles.listVariations}>
                                        { valuesTooltip.map(((item, index) =>
                                            !isNaN(item) && <li key={index} className={styles.itemVariations}>
                                                <div className={styles.leftColVariation}>
                                                    <div
                                                        className={styles.iconVariation}
                                                        style={{ backgroundColor: appState.variation.value !== 1 ?
                                                                variationsColors[appState.variation.value][appState.theme]
                                                                : Object.values(variationsColors)[index][appState.theme] }}></div>
                                                    <div>{appState.variation.value !== 1 ? appState.variation.label : data.variations[index].name}</div>
                                                </div>
                                                <div>{`${item.toFixed(2)}%`}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div> }
            { parsed.length === 0 && <div className={styles.noData}>No data</div> }
        </div>
    );
}

export default Chart;
