'use client'

import AddEntry from "./AddEntry";
import AddQueue from "./AddQueue";
import RunQueue from "./RunQueue";
import EditQueue from "./EditQueue";
import fetcher from "@/lib/fetcher";
import useSWR, { mutate } from "swr";

const QUEUE_API_URL = "/api/queue/";


const BusinessPage = () => {
  // Initial fetch to get the list of queue IDs
  const { data: queue, error: queueError } = useSWR(QUEUE_API_URL, fetcher);
  if (queueError) return <div>Failed to load queues</div>;
  if (!queue) return <div>Loading queues...</div>;

  const handleQueueAdded = () => {
    mutate(QUEUE_API_URL); 
  };

  if (queueError) return <div>Failed to load queues</div>;
  if (!queue) return <div>Loading queues...</div>;

  return (
    <>
      <div className="px-4 md:px-8 lg:px-12 min-h-screen bg-[#FEF9F2]">
            <AddEntry queue={queue}/>
        <div className="pt-8"/>
         <div className="card bg-base-100 w-full shadow-xl bg-lightPurple2">
          <div className="card-body">
            <div className="card-title justify-between">
              <h2>All Queue</h2>
              <AddQueue business_data={queue} onQueueAdded={handleQueueAdded} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {queue.map(q => (
                <div className="card bg-base-100 w-66 shadow-xl" key={q.id}>
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
    </>
  )
}

export default BusinessPage