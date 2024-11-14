'use client'

import AddEntry from "./AddEntry";
import AddQueue from "./AddQueue";
import RunQueue from "./RunQueue";
import EditQueue from "./EditQueue";
import fetcher from "@/lib/fetcher";
import useSWR, { mutate } from "swr";

const BUSINESS_QUEUES_API_URL = "/api/business/queues/";


const BusinessPage = () => {
  // Initial fetch to get the list of queue IDs
  const { data: queue, error: queueError } = useSWR(BUSINESS_QUEUES_API_URL, fetcher);
  if (queueError) return <div>Failed to load queues</div>;
  if (!queue) return <div>Loading queues...</div>;

  const handleQueueAdded = () => {
    console.log("in handle queue add")
    mutate(BUSINESS_QUEUES_API_URL); 
  };

  if (queueError) return <div>Failed to load queues</div>;
  if (!queue) return <div>Loading queues...</div>;

  return (
    <>
    <div className="flex justify-center p-9">
      <div className="grid grid-cols-10 gap-6">
        <div className="lg:col-span-3 md:col-span-3 sm:col-span-10">
          <AddEntry queue={queue}/>
        </div>
        <div className="lg:col-span-7 md:col-span-7 sm:col-span-10">
          <div className="card bg-base-100 w-full h-110 shadow-xl bg-lightPurple2 overflow-y-auto">
              <div className="card-body">
                <div className="card-title justify-between">
                  <h2>All Queue</h2>
                  <AddQueue business_data={queue} onQueueAdded={handleQueueAdded} />
                </div>
                <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
                  {queue.map(q => (
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