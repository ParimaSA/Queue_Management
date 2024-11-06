"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from 'chart.js';
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(...registerables);
const AVG_WEEKLY_ENTRY_API_URL = "/api/business/avg_weekly_entry";

const WeeklyEntryChart: React.FC = () => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { data: avg_weekly_entry, error: entryError } = useSWR(AVG_WEEKLY_ENTRY_API_URL, fetcher);
    const [entryData, setEntryData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

    useEffect(() => {
        if (entryError) {
            console.log("Failed to load avg", entryError);
        } else if (!avg_weekly_entry) {
            console.log("Loading business...");
        } else {
            console.log("Avg data:", avg_weekly_entry);
            const entries = avg_weekly_entry.avg_weekly_entry;
            if (entries && typeof entries === 'object') {
                const updatedEntryData = [0, 0, 0, 0, 0, 0, 0];
                for (const [key, value] of Object.entries(entries)) {
                    const dayIndex = parseInt(key) - 2;
                    if (dayIndex >= 0 && dayIndex < updatedEntryData.length) {
                        updatedEntryData[dayIndex] = value;
                    }
                }
                console.log("Entry data populated:", updatedEntryData);
                setEntryData(updatedEntryData);
            } else {
                console.error("Unexpected structure for entries:", entries);
            }
        }
    }, [avg_weekly_entry, entryError]);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        datasets: [
                            {
                                label: 'Number of Entry',
                                backgroundColor: 'rgba(255, 187, 186)',
                                data: entryData,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
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
    }, [entryData]);

    return <canvas ref={chartRef} />;
}

export default WeeklyEntryChart;