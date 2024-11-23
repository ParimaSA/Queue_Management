'use client'

import AddEntry from "./AddEntry";
import AddQueue from "./AddQueue";
import RunQueue from "./RunQueue";
import EditQueue from "./EditQueue";
import fetcher from "@/lib/fetcher";
import useSWR, { mutate } from "swr";

const BUSINESS_QUEUES_API_URL = "/api/business/queues/";

interface Queue {
  id: number; 
  name: string;
  prefix: string;
}


const BusinessPage = () => {
  const { data: queueData, error: queueError } = useSWR<Queue[]>(BUSINESS_QUEUES_API_URL, fetcher);
  if (queueError) return <div>Failed to load queues</div>;
  if (!queueData) return <div>Loading queues...</div>;

  const handleQueueAdded = () => {
    console.log("in handle queue add")
    mutate(BUSINESS_QUEUES_API_URL); 
  };

  return (
    <>
    <div className="flex justify-center p-9">
      <div className="grid lg:grid-cols-10 md:grid-cols-10 sm:grid-cols-10 gap-6">
        <div className="lg:col-span-3 md:col-span-3 sm:col-span-10">
          <AddEntry queue={queueData}/>
        </div>
        <div className="lg:col-span-7 md:col-span-7 sm:col-span-10">
          <div className="card bg-base-100 w-full h-110 shadow-xl bg-lightPurple2 overflow-y-auto">
              <div className="card-body">
                <div className="card-title justify-between">
                  <h2>All Queue</h2>
                  <AddQueue onQueueAdded={handleQueueAdded} />
                </div>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
                  {queueData.map(q => (
                    <div className="card bg-base-100 w-66 h-83 shadow-xl overflow-hidden" key={q.id}>
                      <div className="card-body">
                        <div className="flex justify-between">
                          <h2 className="card-title">{q.name}</h2>
                          <EditQueue queue={q}/>
                        </div>
                        <RunQueue queue={q}/>
                      </div>
                    </div>
                ))}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default BusinessPage