"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from 'chart.js';
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(...registerables);
const AVG_WEEKLY_ENTRY_API_URL = "/api/analytic/day";

interface Entry{
    day: number;
    entry_count: number;
    waiting_time: number;
}

const WeeklyEntryChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true)
    const chartInstanceRef = useRef<Chart | null>(null);
    const { data: avg_weekly_entry, error: entryError } = useSWR<Entry[]>(AVG_WEEKLY_ENTRY_API_URL, fetcher);
    const [entryData, setEntryData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        setIsLoading(false)
        if (entryError) {
            console.log("Failed to load avg", entryError);
        } else if (!avg_weekly_entry) {
            setIsLoading(true)
        } else {
            console.log("Avg data:", avg_weekly_entry);
            const updatedEntryData = entryData.map((_, dayIndex) => {
                const entry = avg_weekly_entry.find(entry => entry.day - 1 === dayIndex);
                return entry ? entry.entry_count || 0 : 0;
            });
            setEntryData(updatedEntryData);
            console.log("Avg data2:", entryData);
        }
    }, [avg_weekly_entry, entryError]);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                        datasets: [
                            {
                                label: 'Number of Entry',
                                backgroundColor: "#e4d4f6",
                                data: entryData,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of entry',
                                    color: '#333',
                                    font: {
                                        weight: 'bold'
                                    },
                                }
                            },
                            x: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Day',
                                    color: '#333',
                                    font: {
                                        weight: 'bold'
                                    },
                                }
                            }
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
    }, [entryData]);

    if (isLoading) {
        return <span className="loading loading-bars loading-xs"></span>
    }

    return <canvas ref={chartRef} />;
}

export default WeeklyEntryChart;
