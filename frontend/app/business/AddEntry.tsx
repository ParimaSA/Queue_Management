'use client'
import React, { useState, useEffect, useRef } from 'react'
import { mutate } from 'swr';
import QRCode from 'qrcode';
import { useReactToPrint } from 'react-to-print'
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

const QUEUE_ENTRY_API_URL = `/api/queue/entry`;
const QUEUE_API_URL = `/api/queue`;


const AddEntry = ({ queue }) => {
  const queueID = queue.id
  const [selectedQueue, setSelectedQueue] = useState(queue[0]?.id || '');
  const [trackingCode, setTrackingCode] = useState(null);
  const [entryData, setEntryData] = useState(null);
  const [src, setSrc] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (trackingCode !== null) {
      console.log("Updated tracking code:", trackingCode);
      generate();
    }
  }, [trackingCode]);

  useEffect(() => {
    if (queue.length > 0) {
      setSelectedQueue(queue[0].id);
    }
  }, [queue]);
  

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
      setEntryData(data)
      console.log("entry: ", entryData)
      mutate(`${QUEUE_ENTRY_API_URL}/${queueId}`);
      generate();
    } catch (error) {
      console.log("Error adding entry:", error)
    }
  };

  const generate = () => {
    console.log('to generate: ', trackingCode)
    QRCode.toDataURL(`{origin}/customer/${trackingCode}`).then(setSrc)
  }

  const formatDate = (isoDate: string | number | Date) => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const getPageMargins = () => {
    return `@page { margin: 600 0 0 0 !important; }`;
  };

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <>  
          <div className="card shadow-xl h-110 overflow-hidden lg:w-full md:w-full sm:w-full bg-lightPurple1">
            <div className="card-body">
              <h1 className="card-title text-bold mt-3">Add Entry</h1>
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
                  <div className='flex space-x-3'>
                    <h3 className="font-bold">Tracking Code</h3>
                    <h3 className="font-bold text-red-500">{trackingCode}</h3>
                  </div>
                </div>
              )}
              <div className='space-x-3 flex py-2'>
                <select className="select select-bordered lg:w-100 md:w-100 sm:w-90 h-26" onChange={handleSelectedChange}>
                  {queue.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
                <div className="card-actions">
                  <button className='btn h-26 lg:w-16 md:w-16 sm:w-8' onClick={handleAddClick}>
                    Add
                  </button>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl lg:col-span-2 md:col-span-2 sm:col-span-10 h-80 overflow-hidden w-full">
              {entryData ? (
              <div ref={ contentRef }>
                <div className="card-body text-center">
                  <style>{getPageMargins()}</style>
                  {/* Queue Name and Time In */}
                  <div className="text-brown mb-2 text-lg">
                    <p className="text-amber-700 font-semibold text-1g">Queue Name: {entryData.queue_name}</p>
                    <p className="text-amber-700 font-semibold text-1g">Time in: {formatDate(entryData.time_in)}</p>
                  </div>

                  {/* Queue Number */}
                  <h1 className="text-3xl font-bold text-amber-900">{entryData.name}</h1>
                  
                  {/* QR Code */}
                  <div className="mx-auto w-28 h-28 flex items-center justify-center">
                    {src ? <img src={src} alt="QR Code" className="w-full h-full object-contain" /> : "Generating QR Code..."}
                  </div>

                  {/* URL */}
                  <div className="text-black font-bold mb-2 text-lg">
                    <p>[ {origin} ]</p>               
                  </div>

                  {/* Estimated Time and Queue Position */}
                  <div className="text-brown text-lg">
                    <p className="text-amber-700 font-semibold text-1g"> Ahead of you: {entryData.queue_ahead}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                    <button className='btn h-12 w-20 mr-2' onClick={ reactToPrintFn } > <LocalPrintshopIcon style={{ fontSize: 30 }}/> </button>
                </div>
              </div>
                  ) : (
                    <p className="text-xl text-center mt-10 text-gray-500">No QR code generated</p>
                  )}
              </div>
            </div>
          </div>
    </>
  )
}

export default AddEntry;