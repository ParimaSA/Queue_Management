'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import fetcher from "@/lib/fetcher";
import QRCode from "qrcode";
import Image from 'next/image';
import useSWR from "swr";

const ENTRY_TRACKING_CODE_URL = '/api/entry';

interface Queue{
  name: string;
}

interface EntryData {
  id: number;
  business: string;
  queue: Queue;
  name: string;
  time_in: Date;
  queue_ahead: number;
  tracking_code: string;
  Estimated: number;
  status: string;
}

const CustomerPage: React.FC = () => {
  const router = useRouter();
  const { trackingCode } = useParams();
  const [src, setSrc] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    } else {
      console.log("Service Workers are not supported in this browser.");
    }
  }, []);

  // Redirect to /customer if trackingCode is missing
  useEffect(() => {
    if (!trackingCode) {
      router.replace('/customer');
    }
  }, [trackingCode, router]);

  // Ask permission for sending a notification
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    } else {
      console.log("Notifications are not supported on this browser.");
    }
  }, []);

  const { data, error } = useSWR(
    trackingCode ? `${ENTRY_TRACKING_CODE_URL}/${trackingCode}` : null,
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true, // Re-fetch when user focuses on the page
    }
  );

  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Redirect if there's a 404 error (Tracking code is invalid.)
  useEffect(() => {
    if (error?.status === 404) {
      router.replace('/customer');
    }
  }, [error, router]);

  // Show notifications
  useEffect(() => {
    if (data && data.length > 0) {
      const queueAhead = data[0].queue_ahead;
      console.log("Queue ahead:", queueAhead);

      if ('Notification' in window && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          if (Notification.permission === "granted") {
            if (queueAhead === 0) {
              console.log("Sending final notification...");
              reg.showNotification("Your turn has arrived!", {
                body: "Please proceed to the service point.",
                tag: "queue-notification",
              });
            } else if (queueAhead <= 2) {
              console.log("Sending near-turn notification...");
              reg.showNotification("Almost your turn!", {
                body: `Only ${queueAhead} people ahead of you. Please be ready.`,
                tag: "queue-notification",
              });
            }
          }
        });
      }
    }
  }, [data]);

  if (error) return <div>Failed to load entry</div>;

  if (!data) return <div>Loading entry...</div>;

  const formatDate = (isoDate: string | number | Date) => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelMessage(null);

    try {
      const response = await fetch(`/api/entry/cancel-customer/${trackingCode}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setCancelMessage('Entry successfully canceled.');

        // Redirect to /customer 2 seconds after the customer cancels
        setTimeout(() => {
          router.push('/customer');
        }, 2000);
      } else {
        setCancelMessage(result.error || 'Failed to cancel the entry.');
      }
    } catch (error) {
      console.error("Error canceling entry:", error);
      setCancelMessage('Failed to cancel the entry.');
    } finally {
      setIsCancelling(false);
    }
  };

  const generate = () => {
    QRCode.toDataURL(`${window.location.origin}/customer/${trackingCode}`).then(setSrc)
  }
  generate()

  return (
    <div className="bg-cream2 w-screen h-screen flex justify-center items-center">
      {data.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl text-center border-2 border-brown"
          style={{ width: '80%', maxWidth: '800px', height: 'auto', resize: 'both', overflow: 'auto' }} // ทำให้สามารถลากขยายได้
        >
          {data.map((item: EntryData) => (
            <div key={item.id}>
              {/* Business Name */}
              <h3 className="text-yellow-900 text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-brown">{item.business}</h3>
  
              {/* Queue Name and Time In */}
              <div className="text-brown mb-4 text-lg sm:text-xl md:text-2xl">
                <p className="text-amber-700 font-semibold">Queue Name: {item.queue.name}</p>
                <p className="text-amber-700 font-semibold">Time in: {formatDate(item.time_in)}</p>
              </div>
  
              {/* Queue Number */}
              <h1 className="font-bold text-amber-900 mb-2 text-6xl sm:text-7xl md:text-8xl">{item.name}</h1>
  
              {/* QR Code */}
              <div className="mx-auto flex items-center justify-center mb-3" style={{ width: '30%', maxWidth: '200px', height: 'auto' }}>
                {src ? <Image src={src} width={500} height={500} alt="QR Code" className="w-full h-full object-contain" /> : "Generating QR Code..."}
              </div>
  
              {/* URL */}
              <div className="text-black font-bold mb-8 text-sm sm:text-base md:text-lg">
                <a href={`${origin}/customer/${trackingCode}`} target="_blank" rel="noopener noreferrer">{origin}/customer/{trackingCode}</a>
              </div>
  
              {/* Status */}
              <div className="text-amber-900 font-bold mb-3 text-lg sm:text-xl md:text-2xl">
                <p>[ Status: {item.status} ]</p>
              </div>
  
              {/* Estimated Time and Queue Position */}
              <div className="flex justify-around text-amber-700 font-semibold mb-3 sm:text-xl md:text-2xl">
                <div>
                  <p>Estimated Time</p>
                  <p>{item.Estimated ?? "null"}</p>
                </div>
                <div>
                  <p>Ahead of you</p>
                  <p>{item.queue_ahead}</p>
                </div>
              </div>
  
              {/* Show message when it's the user's turn */}
              {item.queue_ahead === 0 && (
                <div className="text-green-600 font-bold sm:text-xl md:text-2xl mb-2">
                  Your turn has arrived!
                </div>
              )}
  
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className={`btn btn-error bg-red-600 border-none text-white sm:text-xl md:text-2xl font-semibold mt-3 ${isCancelling ? 'btn-disabled' : ''}`}
              >
                {isCancelling ? 'Canceling...' : 'Cancel'}
              </button>
  
              {/* Cancel Message */}
              {cancelMessage && (
                <p className="mt-6 sm:text-xl md:text-2xl text-red-600 font-semibold">
                  {cancelMessage}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xl">Loading...</p>
      )}
    </div>
  ); 
}

export default CustomerPage;
