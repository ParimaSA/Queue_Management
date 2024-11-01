'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const CustomerPage: React.FC = () => {
  const { trackingCode } = useParams();
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (trackingCode) {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/entry/add-tracking-code/${trackingCode}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }

          const result = await response.json();
          setData(Array.isArray(result) ? result : [result]);

        } catch (error) {
          console.error('Error fetching data:', error);
          setError('An error occurred while fetching data');
        }
      } else {
        setError('Tracking code is not defined in the URL');
      }
    };

    fetchData();
  }, [trackingCode]);

  const formatDate = (isoDate: string | number | Date) => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="bg-cream2 w-screen h-screen overflow-hidden">
    {data.length > 0 ? (
      <div className="flex justify-center">
        <div className="mt-10 md:mt-20 px-4 md:px-20 w-full max-w-5xl">
          {data.map(item => (
            <div key={item.id} className="mb-8 md:mb-10 text-center">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-5 text-blue-950">
                {item.business}
              </h3>

              <div className="flex justify-center mt-6 md:mt-10">
                <div className="flex flex-row space-x-4 w-full max-w-4xl">

                  <div className="flex-auto bg-lightBlue2 p-4 md:p-6 rounded-lg shadow-lg">
                    <h3 className="text-center text-lg md:text-xl font-semibold">{item.name}</h3>
                  </div>

                  <div className="flex-auto bg-lightBlue3 p-4 md:p-6 rounded-lg shadow-lg">
                    <h3 className="text-center text-lg md:text-xl font-semibold">{item.queue.name}</h3>
                  </div>
                </div>
              </div>

              <div className="min-h-64 p-4 md:p-6 rounded-lg shadow-lg mt-8 md:mt-10 bg-lightPurple2">
                <div className="text-center">
                  <h1 className="text-9xl md:text-9xl mt-7 text-darkPurple">
                    {item.queue_ahead}
                  </h1>
                  <p className="text-sm md:text-lg font-semibold text-darkPurple">
                    Ahead of you
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-6 rounded-lg shadow-lg bg-lightPurple1 mt-8 md:mt-10">
                <p className="text-sm md:text-lg text-pink-900 font-semibold">
                  Time In: {formatDate(item.time_in)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <p>Loading...</p>
    )}
  </div>

  );
}  

export default CustomerPage;
