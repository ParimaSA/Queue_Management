"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chart, registerables } from 'chart.js';
import useSWR from "swr";
import fetcher from "@/lib/fetcher";

Chart.register(...registerables);
const ENTRY_IN_TIME_SLOT_API_URL = "/api/business/entry_in_time_slot";

const QueueVolumeChart: React.FC = () => {
    interface Slot {
        start_time: number;
        entry_count: number;
    }

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const { data: entry_in_time_slot, error: entryError } = useSWR<Slot[]>(ENTRY_IN_TIME_SLOT_API_URL, fetcher);
    const [entryData, setEntryData] = useState<number[]>([]);
    const [timeSlot, setTimeSlot] = useState<number[]>([]);

    useEffect(() => {
        if (entryError) {
            console.log("Failed to load avg", entryError);
        } else if (!entry_in_time_slot) {
            console.log("Loading business...");
        } else {
            console.log("Slot data:", entry_in_time_slot);
            const updatedEntryData = entry_in_time_slot.map(slot => slot.entry_count || 0);
            const updatedTimeSlot = entry_in_time_slot.map(time => time.start_time || 0);
            console.log("Entry data populated: ", updatedEntryData);
            console.log("Time Slot: ", updatedTimeSlot);
            setEntryData(updatedEntryData);
            setTimeSlot(updatedTimeSlot);
        }
    }, [entry_in_time_slot, entryError]);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: timeSlot,
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
                                    text: 'Time',
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

    return <canvas ref={chartRef} />;
}

export default QueueVolumeChart;