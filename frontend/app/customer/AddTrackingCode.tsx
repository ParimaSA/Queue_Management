"use client";
import React, { useState } from 'react';

const AddTrackingCode: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');

  const handleTrackingCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTrackingCode(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (trackingCode) {
      // Redirect to the new page with tracking code in the URL
      window.location.href = `/customer/${trackingCode}`;
    }
  };

  const addTrackingCodeBackground = {
    backgroundImage: "url('/add_tracking_code_background.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  };

  return (
    <div style={addTrackingCodeBackground}>
      <form onSubmit={handleSubmit} className="text-center">
        <h1 className="text-3xl font-semibold mb-8 mt-36 text-brightPink">
          Enter Tracking Code
        </h1>
        <div>
          <input
            type="text"
            placeholder="Tracking Code"
            value={trackingCode}
            onChange={handleTrackingCodeChange}
            className="input input-bordered border-stone-300 w-96"
          />
          <button type="submit" className="btn text-white ml-3 bg-brightPink2 hover:bg-fuchsia-700">
            Enter
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTrackingCode;