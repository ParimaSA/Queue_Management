import React from 'react';

function Preview(props) {
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

                        <div className="grid grid-cols-1 gap-4">
                            {[{ name: props.newQueue, prefix: props.newAlphabet }].map((q, index) => (
                                <div className="card bg-base-100 w-66 shadow-xl" key={index}>
                                    <div className="card-body">
                                        {/* Title at the top */}
                                        <h2 className="card-title">{q.name}</h2>

                                        {/* If prefix exists, show queue for preview */}
                                        <div className="flex flex-col gap-4 mt-4">
                                        {q.prefix && (
                                        <>
                                        <div className="border p-4 rounded-md shadow-md">
                                            <p>{q.prefix}1</p>
                                        </div>
                                        <div className="border p-4 rounded-md shadow-md">
                                            <p>{q.prefix}2</p>
                                        </div>
                                        <div className="border p-4 rounded-md shadow-md">
                                            <p>{q.prefix}3</p>
                                        </div>
                                        </>
                                        )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <br />
            </div>
        </div>
    );
}
export default Preview;