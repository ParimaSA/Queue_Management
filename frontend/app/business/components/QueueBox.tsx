import React from "react";

// Define the TypeScript interface for queue props
interface Queue {
  name: string;
  last_entry: string;
}

interface QueueBoxProps {
  queues: Queue[];
}

const QueueBox: React.FC<QueueBoxProps> = ({ queues }) => {
  return (
    <div
      className="grid gap-4 grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] place-items-center"
    >
      {queues.map((queue, index) => (
        <div
          key={index}
          className="min-h-[150px] w-full flex justify-center bg-white shadow-lg rounded-lg ml-10 mr-10 p-4 pl-10 pr-10 text-center hover:shadow-xl transition-transform transform hover:-translate-y-1"
        >
            <div className="flex justify-between items-center w-full">
                <h3 className="text-3xl font-bold text-gray-700">{queue.name}</h3>
                <span
                    className={`text-4xl py-2 px-4 rounded-full pl-10 pr-10 ${
                        queue.last_entry!=="-" ? "bg-green3 text-white" : ""
                    }`}
                    >
                    {queue.last_entry || "-"}
                </span>
            </div>
        </div>
      ))}
    </div>
  );
};

export default QueueBox;
