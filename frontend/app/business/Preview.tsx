import React from 'react';

function Preview(props) {
    const { newQueue, newAlphabet } = props;
    console.log("check: ", newQueue)
    const arrayNewQueue = Array.isArray(newQueue) ? newQueue : [newQueue];

    return (
        <div>
            <div className="px-4 md:px-8 lg:px-12 min-h-80 bg-[#FEF9F2]">
                <br />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h1>Preview</h1>
                </div>
                <div className="pt-8" />
                <div className="card bg-base-100 w-full shadow-xl bg-lightPurple2">
                    <div className="card-body">
                        <div className="card-title justify-between">
                            <h2>All Queue</h2>
                        </div>

                        <div className={`grid ${arrayNewQueue.length === 1 ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                            {newQueue.length === 0 ? (
                                <p>No queues available</p>
                            ) : (
                                arrayNewQueue.map((queueName, index) => (
                                    <div className="card bg-base-100 w-66 shadow-xl" key={index}>
                                        <div className="card-body">
                                            <h2 className="card-title">{queueName}</h2>
                                            <div className="flex flex-col gap-4 mt-4">
                                                {[1, 2, 3].map((num) => (
                                                    <div
                                                        className="border p-4 rounded-md shadow-md"
                                                        key={num}
                                                    >
                                                        <p>{newAlphabet[index]}{num}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                <br />
            </div>
        </div>
    );
}

export default Preview;
