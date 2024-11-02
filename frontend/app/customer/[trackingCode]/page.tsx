'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import fetcher from "@/lib/fetcher";
import useSWR from "swr";

const ENTRY_TRACKING_CODE_URL = '/api/entry';

const CustomerPage: React.FC = () => {
  const router = useRouter();
  const { trackingCode } = useParams();

  // Redirect to /customer if trackingCode is missing
  useEffect(() => {
    if (!trackingCode) {
      router.replace('/customer');
    }
  }, [trackingCode, router]);

  const { data, error } = useSWR(trackingCode ? `${ENTRY_TRACKING_CODE_URL}/${trackingCode}` : null, fetcher);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Redirect if there's a 404 error (Tracking code is invalid.)
  useEffect(() => {
    if (error?.status === 404) {
      router.replace('/customer');
    }
  }, [error, router]);

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

        // Redirect to /customer after 2 seconds
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

  return (
    <div className="bg-cream2 w-screen h-screen overflow-hidden">
      {data.length > 0 ? (
        <div className="flex justify-center">
          <div className="mt-10 md:mt-20 px-4 md:px-20 w-full max-w-5xl">
            {data.map(item => (
              <div key={item.id} className="mb-8 md:mb-10 text-center">
                <h3 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-5 text-blue-950">
                  {item.business}
                </h3>

                <div className="flex justify-center mt-6 md:mt-10">
                  <div className="flex flex-row space-x-4 w-full max-w-4xl">
                    <div className="flex-auto text-cyan-900 bg-lightBlue2 p-4 md:p-6 rounded-lg shadow-lg">
                      <h3 className="text-center text-lg md:text-xl font-semibold">
                        Queue Number <br />
                        {item.name}
                      </h3>
                    </div>

                    <div className="flex-auto text-blue-900 bg-lightBlue3 p-4 md:p-6 rounded-lg shadow-lg">
                      <h3 className="text-center text-lg md:text-xl font-semibold">
                        Queue Name <br />
                        {item.queue.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="min-h-64 p-4 md:p-6 rounded-lg shadow-lg mt-8 md:mt-10 bg-lightPurple2">
                  <div className="text-center">
                    <h1 className="text-9xl md:text-9xl mt-7 text-darkPurple">
                      {item.queue_ahead}
                    </h1>
                    <p className="text-lg md:text-xl font-semibold text-darkPurple">
                      Ahead of you
                    </p>
                  </div>
                </div>

                <div className="p-4 md:p-6 rounded-lg shadow-lg bg-lightPurple1 mt-8 md:mt-10">
                  <p className="text-lg md:text-xl text-pink-900 font-semibold">
                    Time In: {formatDate(item.time_in)}
                  </p>
                </div>

                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className={`btn btn-error text-white text-base md:text-lg mt-10 px-20 ${isCancelling ? 'btn-disabled' : ''}`}
                >
                  {isCancelling ? 'Canceling...' : 'Cancel'}
                </button>


                {cancelMessage && (
                  <p className="mt-4 text-lg text-red-600 font-semibold">
                    {cancelMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default CustomerPage;