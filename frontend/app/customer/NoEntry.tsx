"use client";
import React, { useState } from 'react';

const NoEntry: React.FC = () => {

  return (
    <div className="bg-cream2 w-screen h-screen flex justify-center items-center">
        <div className="bg-red-100 rounded-lg shadow-lg p-10 max-w-sm w-full text-center border-2 border-none">
            <h1 className='text-xl text-red-900 font-bold'>No Entry Found</h1>
            <h2 className='text-l text-red-700 font-bold '>Contact the business to get an entry.</h2>
        </div>
    </div>
  );
};

export default NoEntry;