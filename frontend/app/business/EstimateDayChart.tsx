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

const EstimateDayChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [isLoading, setIsLoading] = useState(true)
    const { data: avg_waiting_time, error: entryError } = useSWR<Entry[]>(AVG_WEEKLY_ENTRY_API_URL, fetcher);
    const [entryData, setEntryData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        setIsLoading(false)
        if (entryError) {
            console.log("Failed to load avg", entryError);
        } else if (!avg_waiting_time) {
            setIsLoading(true)
        } else {
            console.log("Avg data:", avg_waiting_time);
            const updatedEntryData = entryData.map((_, dayIndex) => {
                const entry = avg_waiting_time.find(entry => entry.day - 1 === dayIndex);
                return entry ? entry.waiting_time || 0 : 0;
            });
            setEntryData(updatedEntryData);
            console.log("Avg data2:", entryData);
        }
    }, [avg_waiting_time, entryError]);

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
                                label: 'Average waiting time (minute)',
                                backgroundColor: "#ffcde8",
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
                                    text: 'Average waiting time (minute)',
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

export default EstimateDayChart;
