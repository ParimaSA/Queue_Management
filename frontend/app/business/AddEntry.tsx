'use client'
import React, { useState, useEffect, useRef } from 'react'
import { mutate } from 'swr';
import QRCode from 'qrcode';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print'
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';

const QUEUE_ENTRY_API_URL = `/api/queue/entry`;
const QUEUE_API_URL = `/api/queue`;

interface Queue {
  id: number; 
  name: string;
  prefix: string;
}

interface AddEntryProps {
  queue: Queue[];
}


interface EntryData {
  queue_name: string;
  name: string;
  time_in: Date;
  queue_ahead: number;
  tracking_code: string;
  status: string;
}


const AddEntry: React.FC<AddEntryProps>  = ({ queue }) => {
  const [selectedQueue, setSelectedQueue] = useState(queue[0]?.id || null);
  const [trackingCode, setTrackingCode] = useState(null);
  const [entryData, setEntryData] = useState<EntryData | null>(null);
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
  });

  useEffect(() => {
    if (!selectedQueue) {
      setSelectedQueue(queue[0]?.id);
    }
  }, [queue]);
  

  const handleSelectedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQueue(parseInt(event.target.value));
  }

  const handleAddClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedQueue) {
      console.log('Selected Queue id:', selectedQueue)
      await handleSubmit(selectedQueue)
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
    QRCode.toDataURL(`${origin}/customer/${trackingCode}`).then(setSrc)
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
          <div className="card shadow-xl h-110 overflow-hidden lg:w-full md:w-full sm:w-full bg-lightPink2">
            <div className="card-body">
              <h1 className="card-title text-bold mt-3">Add Entry</h1>
              <div className='space-x-3 flex py-2'>
                <select className="select select-bordered lg:w-[100vw] md:w-[100vw] sm:w-[90vw] h-[8vh]" onChange={handleSelectedChange}>
                  {queue.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
                <div className="card-actions">
                  <button className='btn h-[8vh] lg:w-full md:w-full sm:w-full' onClick={handleAddClick}>
                    Add
                  </button>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl lg:col-span-2 md:col-span-2 sm:col-span-10 h-[55vh] overflow-hidden w-full">
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
                    {src ? <Image src={src} height={700} width={700} alt="QR Code" className="w-full h-full object-contain" /> : "Generating QR Code..."}
                  </div>

                  {/* URL */}
                  <div className="text-black font-bold mb-2 text-sm">
                    <a href={`${origin}/customer/${trackingCode}`} target="_blank" rel="noopener noreferrer">{origin}/customer/{trackingCode}</a>                 
                  </div>

                  {/* Estimated Time and Queue Position */}
                  <div className="text-brown text-lg">
                    <p className="text-amber-700 font-semibold text-1g"> Ahead of you: {entryData.queue_ahead}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    className="btn h-12 w-20 mr-2"
                    onClick={() => reactToPrintFn && reactToPrintFn()}
                  >
                    <LocalPrintshopIcon style={{ fontSize: 30 }} />
                  </button>
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