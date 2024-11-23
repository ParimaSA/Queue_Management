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
    <div className="bg-cream2 w-screen h-screen flex justify-center items-center px-4 sm:px-6">
    {data.length > 0 ? (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full lg:w-[40vw] md:w-[50vw] sm:w-[50vw] h-[82vh] sm:h-[84vh] md:h-[90vh] lg:h-[82vh] border-t-4 border-brown flex flex-col justify-between">
        {data.map((item: EntryData) => (
          <div key={item.id}>
            {/* Business Name */}
            <h3 className="text-brown text-lg sm:text-xl font-bold mb-2 text-center">
              {item.business}
            </h3>

            {/* Queue Name and Time In */}
            <div className="bg-brown/10 rounded-md p-3 mb-3 grid grid-cols-2 text-center">
              <div>
                <p className="text-gray-700 font-semibold">Queue Name</p>
                <p className="text-amber-700 font-semibold text-sm">{item.queue.name}</p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold">Time In</p>
                <p className="text-amber-700 font-semibold text-sm">{formatDate(item.time_in)}</p>
              </div>
            </div>

            {/* Queue Number */}
            <div className="flex flex-col items-center mb-1">
              <h1 className="font-bold text-amber-900 text-4xl sm:text-5xl mb-1">
                {item.name}
              </h1>
              <p className="text-gray-500 font-medium text-sm">Your queue number</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-2">
              <div className="w-[35vw] sm:w-[20vw] md:w-[20vw] lg:w-[12vw]">
                {src ? (
                  <Image
                    src={src}
                    width={100}
                    height={100}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  "Generating QR Code..."
                )}
              </div>
            </div>

            {/* URL */}
            <div className="text-center text-blue-600 font-bold text-xs sm:text-sm mb-2">
              <a
                href={`${origin}/customer/${trackingCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {origin}/customer/{trackingCode}
              </a>
            </div>

            {/* Status */}
            <p className="text-amber-900 font-bold text-lg mb-2 text-center">
              Status: {item.status}
            </p>

            {/* Estimated Time and Queue Position */}
            <div className="flex justify-around text-amber-700 font-semibold mb-3 sm:text-md md:text-md text-left">
              <div>
                <p className="text-gray-700 font-semibold">Estimated Time</p>
                <p className="text-amber-700 font-bold">
                  {item.Estimated ?? "null"}
                </p>
              </div>
              <div>
                <p className="text-gray-700 font-semibold">Ahead of You</p>
                <p className="text-amber-700 font-bold">{item.queue_ahead}</p>
              </div>
            </div>

            {/* Turn Notification */}
            {item.queue_ahead === 0 && (
              <div className="bg-green-100 text-green-700 font-bold text-sm rounded-md p-3 mb-3">
                Your turn has arrived! Please proceed to the service point.
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className={`w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out ${
                isCancelling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCancelling ? 'Canceling...' : 'Cancel'}
            </button>

            {/* Cancel Message */}
            {cancelMessage && (
              <p className="mt-4 text-center text-red-600 font-semibold text-sm">
                {cancelMessage}
              </p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm">Loading...</p>
    )}
  </div>
  ); 
}

export default CustomerPage;
