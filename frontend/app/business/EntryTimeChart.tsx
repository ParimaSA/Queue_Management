"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(...registerables);
const ENTRY_IN_TIME_SLOT_API_URL = "/api/analytic/time";

const EntryTimeChart: React.FC = () => {
    interface Slot {
        start_time: number;
        entry_count: number;
        num_entry: number;
    }
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { data: entry_in_time_slot, error: entryError } = useSWR<Slot[]>(ENTRY_IN_TIME_SLOT_API_URL, fetcher);
    const [chartData, setChartData] = useState<{ timeRange: string; entry: number }[]>([]);

    useEffect(() => {
        if (entryError) {
            console.error("Failed to load data", entryError);
        } else if (entry_in_time_slot) {
            const updatedData = entry_in_time_slot.map((slot) => ({
                timeRange: `${slot.start_time}:00 - ${slot.start_time+2}:00`,
                entry: slot.num_entry || 0,
            }));
            setChartData(updatedData);
        }
    }, [entry_in_time_slot, entryError]);

    useEffect(() => {
        if (chartRef.current && chartData.length > 0) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                // Prepare labels and data for vertical bars
                const labels = chartData.map((d) => d.timeRange);
                const datasetData = chartData.map((d) => d.entry);

                // Create Chart.js instance
                chartInstanceRef.current = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Number of entry",
                                data: datasetData,
                                backgroundColor: "rgba(255, 187, 186, 0.8)",
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
                                    text: "Number of entry",
                                    color: "#333",
                                    font: { weight: "bold" },
                                },
                            },
                        },
                    },
                });
            }
        }

        // Cleanup on unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData]);

    return <canvas ref={chartRef} />;
};

export default EntryTimeChart;
