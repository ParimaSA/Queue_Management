'use client'
import React, { useState, useEffect } from 'react'
import { mutate } from 'swr';
import QRCode from "qrcode";

const QUEUE_ENTRY_API_URL = `/api/queue/entry`;
const QUEUE_API_URL = `/api/queue`;


const AddEntry = ({ queue }) => {
  const [selectedQueue, setSelectedQueue] = useState(queue[0]?.id || '');
  const [trackingCode, setTrackingCode] = useState(null);
  const [src, setSrc] = useState<string | null>(null); 

  useEffect(() => {
    if (trackingCode !== null) {
      console.log("Updated tracking code:", trackingCode);
      generate();
    }
  });

  const handleSelectedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQueue(event.target.value);
  }

  const handleAddClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedQueue) {
      console.log('Selected Queue id:', selectedQueue)
      await handleSubmit(parseInt(selectedQueue, 10))
    } else {
      console.log('No selected')
    }
  }

  const handleSubmit = async (queueId: number) => {
    try {
      const response = await fetch(`${QUEUE_API_URL}/${queueId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.log("Failed to add entry")
        return
      }

      const data = await response.json()
      console.log("Response:", data)
      setTrackingCode(data.tracking_code)

      mutate(`${QUEUE_ENTRY_API_URL}/${queueId}`);
      generate();
    } catch (error) {
      console.log("Error adding entry:", error)
    }
  };

  const generate = () => {
    console.log('to generate: ', trackingCode)
    QRCode.toDataURL(`${window.location.origin}/customer/${trackingCode}`).then(setSrc)
  }

  return (
    <>
        <div className="grid grid-cols-5 gap-4 w-full">
          <div className="card bg-base-100 shadow-xl col-span-4 h-60 overflow-hidden w-full bg-lightPurple1">
            <div className="card-body">
            <h1 className="card-title text-xl">Add Entry</h1>
            {trackingCode && (
              <div role="alert" className="alert shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info h-6 w-6 shrink-0">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className='flex space-x-6'>
                <h3 className="font-bold">Tracking Code</h3>
                <h3 className="font-bold text-red-500">{trackingCode}</h3>
              </div>
            </div>
            )}
          <div className='space-x-3 flex py-6'>
            <select className="select select-bordered w-100 h-26" onChange={handleSelectedChange}>
              {queue.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
            <div className="card-actions">
              <button className='btn h-26 w-32' onClick={handleAddClick}>
                Add
              </button>
            </div>
          </div>
          </div>
          </div>
          <div className="card bg-base-100 shadow-xl col-span-1 h-60 overflow-hidden w-full bg-cream">
          <div className="card-body">
            {src ? (
              <img src={src} alt="QR Code" className='h-50'/>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-500">No QR Code generated</p>
              </div>
            )}
          </div>
          </div>
        </div>
    </>
  )
}

export default AddEntry;