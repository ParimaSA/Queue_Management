'use client'

import React from 'react'
import fetcher from "@/lib/fetcher";
import useSWR from "swr";
import { useEffect} from 'react';

const TOP_QUEUE_API_URL = "/api/business/top_queues";

const TopQueue = () => {
    const { data: top_queue, error: topQueueError } = useSWR(TOP_QUEUE_API_URL, fetcher);
    console.log(top_queue, topQueueError);
    useEffect(() => {
        if (topQueueError) {
        console.log("Failed to load business", topQueueError);
        } else if (!top_queue) {
        console.log("Loading business...");
        } else {
        console.log("Business data:", top_queue);
        }
    }, [top_queue, topQueueError]);
    return (
            <>
            <div className='flex space-x-2 px-20'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                </svg>
                <div className='text-2xl font-bold'>Top 3 Queues</div>
                <div className='py-8'/>
            </div>
            <div className="overflow-x-auto lg:w-96 md:w-full sm:w-full">
                <table className="table">
                <tbody>
                    {top_queue && top_queue.length > 0 ? (
                    top_queue.map((queue, index) => (
                        <tr key={queue.id} className={`hover text-xl ${index === 0 ? 'bg-lightOrange1' : index === 1 ? 'bg-lightOrange2' : 'bg-lightOrange3'}`}>
                        <th>{index + 1}</th>
                        <td>{queue.name}</td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td className="text-center">No queues available</td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            </>
    )
}

export default TopQueue