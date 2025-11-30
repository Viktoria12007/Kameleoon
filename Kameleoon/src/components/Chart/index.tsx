import * as d3 from "d3";
import type ChartInterface from "../../types/ChartTypes.ts";
import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../../contexts/AppContext.ts";

interface ChartProps {
    data?: ChartInterface,
    width?: number,
    height?: number,
}

const Chart = ({ data = [], width = 1300, height = 330 }: ChartProps) => {
    const { appState, setAppState } = useContext(AppContext);

    const marginBottom = 30;
    const marginLeft = 40;
    const marginRight = 20;
    const marginTop = 20;
    const innerW = width - marginLeft - marginRight;
    const innerH = height - marginTop - marginBottom;
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const getWeekDay = (date: Date) => weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1];

    const gx = useRef(null);
    const gy = useRef(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    let parsed: [Array<{ date: Date, value: number }> | undefined] | undefined;
    let x;
    let y;
    const colors = ["#46464F", "#4142EF", "#FF8346", "#35BDAD", "#FFB958", "#DF57BC"];
    const variationsColors = data?.variations.reduce((acc, item, index) => {
        acc['id' in item ? item.id : 0] = colors[index];
        return acc;
    }, {});

    if (appState?.variation.value === 1) {
        parsed = data?.variations.map(item => data?.data.map(d => ({
            date: new Date(d.date),
            value: conversionRate(d, item),
        })).sort((a, b) => a.date - b.date));
    } else {
        parsed = [data?.data.map(d => ({
            date: new Date(d.date),
            value: conversionRate(d),
        })).sort((a, b) => a.date - b.date)];
    }

    if (appState?.timePeriod.value === 0) {
        x = d3.scaleTime().domain(d3.extent(parsed?.flat(), d => d.date)).range([marginLeft, width - marginRight]);
    } else {
        const getWeekIndex = (date: Date) => (date.getDay() + 6) % 7;
        x = d3.scaleLinear().domain([0, 6]).range([marginLeft, width - marginRight]);
    }

    y = d3.scaleLinear().domain(d3.extent(parsed?.flat(), d => d.value)).range([height - marginBottom, marginTop]);

    let line = d3.line().defined(d => !isNaN(d.value)).x((d) => x(d.date)).y((d) => y(d.value));
    let area;
    if (appState?.lineStyle.value === 1) {
        line = line.curve(d3.curveMonotoneX);
    } else if (appState?.lineStyle.value === 2) {
        line = line.curve(d3.curveMonotoneX);
        area = d3.area().defined(d => !isNaN(d.value)).x((d) => x(d.date)).y0(y(d3.min(parsed?.flat(), (d) => d.value))).y1((d) => y(d.value)).curve(d3.curveMonotoneX);
    }

    useEffect(() => {
        let axis;
        if (appState?.timePeriod.value === 0) {
            axis = d3.select(gx.current).call(d3.axisBottom(x).tickFormat(d3.utcFormat("%x")));
        } else {
            axis = d3.select(gx.current).call(d3.axisBottom(x).ticks(7).tickFormat(i => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][Number(i)]));
        }
        axis.call(g => g.selectAll(".tick line").remove())
        .call(g => g.selectAll(".tick text").attr("fill", "#918F9A"))
        .call(g => g.selectAll(".domain").remove())
    }, [gx, x, appState?.timePeriod.value]);
    useEffect(() => void d3.select(gy.current).call(d3.axisLeft(y).ticks(4).tickFormat((domainValue) => `${domainValue}%`))
            .call(g => g.selectAll(".tick line").remove())
            .call(g => g.selectAll(".tick text").attr("fill", "#918F9A"))
            .call(g => g.selectAll(".domain").remove()),
        [gy, y]);

    function conversionRate(item, variationSelected = data?.variations[0]) {
        if (appState?.variation.value === 1) {
            const variationSelectedId = 'id' in variationSelected ? variationSelected.id : 0;
            return (item.conversions[variationSelectedId] / item.visits[variationSelectedId]) * 100;
        }
        return (item.conversions[appState?.variation.value] / item.visits[appState?.variation.value]) * 100;
    }

    function handleMouseOver() {
        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
        }
    }

    function handleMouseOut() {
        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
        }
    }

    function handleMouseMove(event) {
        const [mx] = d3.pointer(event, this);
        const x0 = x.invert(mx);
        // find nearest point
        const bisect = d3.bisector(d => d.date).left;
        const idx = Math.min(parsed?.flat().length - 1, Math.max(0, bisect(parsed as Array<{ date: Date, value: number }>, x0)));
        const d0 = (parsed as Array<{ date: Date, value: number }>)[idx];
        // position focus
        // focus.attr('transform', `translate(${x(d0.date)},${y(d0.value)})`)
        if (tooltipRef.current) {
            const tt = tooltipRef.current;
            const dateStr = d3.timeFormat('%Y-%m-%d %H:%M')(d0?.date)
            tt.innerHTML = `<strong>${dateStr}</strong>`
            // position tooltip (avoid overflow)
            const parentRect = containerRef.current.getBoundingClientRect()
            const left = Math.min(parentRect.width - 160, marginLeft + x(d0?.date) + 12)
            const top = marginTop + y(d0?.value) - 12
            tt.style.left = `${left}px`
            tt.style.top = `${top}px`
        }
    }

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                { parsed?.flat().length &&
                    <>
                        <rect
                            width={width}
                            height={height}
                            fill="transparent"
                            onMouseOver={handleMouseOver}
                            onMouseOut={handleMouseOut}
                            onMouseMove={handleMouseMove}
                        />
                        <g ref={gx} transform={`translate(0,${height - marginBottom})`} />
                        <g ref={gy} transform={`translate(${marginLeft},0)`} />
                        <g>
                            <g>
                                { x.ticks().map((d, i) => (<line key={i} x1={0.5 + x(d)} x2={0.5 + x(d)} y1={marginTop} y2={height - marginBottom} stroke={'#E1DFE7'} strokeDasharray={'6'} />)) }
                            </g>
                            <g>
                                { y.ticks().map((d, i) => (<line key={i} x1={marginLeft} x2={width - marginRight} y1={0.5 + y(d)} y2={0.5 + y(d)} stroke={'#E1DFE7'} />)) }
                            </g>
                        </g>
                        { parsed.map((p, index) =>
                            <g key={index}>
                                <path
                                    fill="none"
                                    stroke={appState?.variation.value !== 1 ? variationsColors[appState?.variation.value] : Object.values(variationsColors)[index]}
                                    strokeWidth="2"
                                    d={line(p?.filter(d => !isNaN(d.value)))}
                                />
                                <path
                                    fill="none"
                                    stroke={appState?.variation.value !== 1 ? variationsColors[appState?.variation.value] : Object.values(variationsColors)[index]}
                                    strokeWidth="2"
                                    d={line(p)}
                                />
                                { appState?.lineStyle.value === 2 &&
                                    <path
                                        fill={appState.variation.value !== 1 ? variationsColors[appState.variation.value] : Object.values(variationsColors)[index]}
                                        fillOpacity="0.2"
                                        stroke="none"
                                        d={area(p?.filter(d => !isNaN(d.value)))}
                                    />
                                }
                            </g>
                        )}
                    </>
                }
                { !parsed?.length && <text textAnchor="middle" fill="#918F9A">No data</text> }
            </svg>
            <div
                ref={tooltipRef}
                style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'none',
                    minWidth: 120,
                    background: 'rgba(255,255,255,0.98)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    padding: '8px 10px',
                    borderRadius: 6,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    fontSize: 13,
                    color: '#111',
                }}
            />
        </div>
    );
}

export default Chart;
