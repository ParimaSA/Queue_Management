"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(...registerables);
const ENTRY_IN_QUEUE_API_URL = "/api/analytic/queue";


const EntryQueueChart: React.FC = () => {
    interface Queue {
        queue: string;
        entry_count: number;
        waiting_time: number;
    }
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [isLoading, setIsLoading] = useState(true)
    const { data: entryData, error: entryError } = useSWR<Queue[]>(ENTRY_IN_QUEUE_API_URL, fetcher);
    const [chartData, setChartData] = useState<{ queue: string; entry: number }[]>([]);

    useEffect(() => {
        setIsLoading(false)
        if (entryError) {
            console.error("Failed to load data", entryError);
        } 
        else if (!entryData){
            setIsLoading(true)
        }
        else {
            const updatedData = entryData.map((queue) => ({
                queue: queue.queue,
                entry: queue.entry_count || 0,
            }));
            setChartData(updatedData);
        }
    }, [entryData, entryError]);

    useEffect(() => {
        if (chartRef.current && chartData.length > 0) {
            const ctx = chartRef.current.getContext("2d");
            if (ctx) {
                // Prepare labels and data for vertical bars
                const labels = chartData.map((d) => d.queue);
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
                                    text: "Queue",
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

export default EntryQueueChart;
