"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(...registerables);
const ENTRY_IN_TIME_SLOT_API_URL = "/api/analytic/time";

const EstimateTimeChart: React.FC = () => {
    interface Slot {
        start_time: number;
        entry_count: number;
        num_entry: number;
        estimate_waiting: number;
    }

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [isLoading, setIsLoading] = useState(true)

    const { data: entry_in_time_slot, error: entryError } = useSWR<Slot[]>(ENTRY_IN_TIME_SLOT_API_URL, fetcher);
    const [chartData, setChartData] = useState<{ timeRange: string; entry: number }[]>([]);

    useEffect(() => {
        setIsLoading(false)
        if (entryError) {
            console.error("Failed to load data", entryError);
        } else if (!entry_in_time_slot){
            setIsLoading(true)
        } else {
            const updatedData = entry_in_time_slot.map((slot) => ({
                timeRange: `${slot.start_time}:00 - ${slot.start_time+2}:00`,
                entry: slot.estimate_waiting || 0,
            }));
            setChartData(updatedData);
        }
    }, [entry_in_time_slot, entryError]);

    useEffect(() => {
        if (chartRef.current && chartData.length > 0) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                const labels = chartData.map((d) => d.timeRange);
                const datasetData = chartData.map((d) => d.entry);

                chartInstanceRef.current = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels, 
                        datasets: [
                            {
                                label: "Waiting Time(minute)",
                                data: datasetData, 
                                backgroundColor: "#ffcde8",
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: "Time Ranges",
                                    color: "#333",
                                    font: { weight: "bold" },
                                },
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: "Average waiting time (minute)",
                                    color: "#333",
                                    font: { weight: "bold" },
                                },
                            },
                        },
                    },
                });
            }
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData]);

    if (isLoading) {
        return <span className="loading loading-bars loading-xs"></span>
    }

    return <canvas ref={chartRef} />;
};

export default EstimateTimeChart;
