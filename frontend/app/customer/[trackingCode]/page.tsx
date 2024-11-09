'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import fetcher from "@/lib/fetcher";
import QRCode from "qrcode";
import useSWR from "swr";

const ENTRY_TRACKING_CODE_URL = '/api/entry';

const CustomerPage: React.FC = () => {
  const router = useRouter();
  const { trackingCode } = useParams();
  const [src, setSrc] = useState<string | null>(null);

  // Redirect to /customer if trackingCode is missing
  useEffect(() => {
    if (!trackingCode) {
      router.replace('/customer');
    }
  }, [trackingCode, router]);

  // Ask permission for sending a notification
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
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

  // Show notification
  useEffect(() => {
    if (data && data.length > 0) {
      const firstInQueue = data[0].queue_ahead === 0;
      console.log("Queue ahead:", data[0].queue_ahead);
      if (firstInQueue) {
        if (Notification.permission === "granted") {
          console.log("Sending notification...");
          new Notification("Your turn has arrived!", { body: "Please proceed to the service point." });
        } 
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
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-sm w-full text-center border-2 border-brown">
          {data.map((item) => (
            <div key={item.id}>
              {/* Business Name */}
              <h3 className="text-yellow-900 text-3xl font-bold mb-4 text-brown">{item.business}</h3>
  
              {/* Queue Name and Time In */}
              <div className="text-brown mb-6 text-lg">
                <p className=" text-amber-700 font-semibold">Queue Name: {item.queue.name}</p>
                <p className="text-amber-700 font-semibold">Time in: {formatDate(item.time_in)}</p>
              </div>
  
              {/* Queue Number */}
              <h1 className="text-7xl font-bold text-amber-900 mb-8">{item.name}</h1>
  
              {/* QR Code */}
              <div className="mx-auto w-32 h-32 flex items-center justify-center mb-8">
                {src ? <img src={src} alt="QR Code" className="w-full h-full object-contain" /> : "Generating QR Code..."}
              </div>
  
              {/* Estimated Time and Queue Position */}
              <div className="flex justify-around text-amber-700 text-lg font-semibold mb-6">
                <div>
                  <p>Estimated Time</p>
                  <p>{item.Estimated ?? "null"}</p>
                </div>
                <div>
                  <p>Ahead of you</p>
                  <p>{item.queue_ahead}</p>
                </div>
              </div>
  
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className={`btn btn-error bg-red-600 border-none text-white text-lg font-semibold mt-6 ${isCancelling ? 'btn-disabled' : ''}`}
              >
                {isCancelling ? 'Canceling...' : 'cancel'}
              </button>

  
              {/* Cancel Message */}
              {cancelMessage && (
                <p className="mt-6 text-xl text-red-600 font-semibold">
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
