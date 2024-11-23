import React from 'react';
import Link from 'next/link';
import { fredoka } from './fonts/fonts';

const Home = () => {
  return (
    <>
     <main className="flex flex-col justify-center items-center min-h-screen bg-cream2 lg:px-32 md:px-20 sm:px-10">
      <div className={`${fredoka.className} antialiased px-6 py-16 text-center`}>
        <div className="bg-white shadow-lg rounded-3xl p-6 md:p-14 lg:p-16 relative -translate-y-8 w-full max-w-5xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-darkBlue">
            Queue
            <span className="text-lightBlue4 block">Management</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl lg:text-2xl text-lightPurple font-medium">
            Keep your business organized and your customers happy with our queue management solution.
          </p>
          <div className="mt-12 flex justify-center">
            <Link href="/business/login">
              <button className="w-60 lg:w-72 px-8 py-4 text-lg font-semibold rounded-full bg-lightPurple3 text-white shadow-md hover:bg-purple-900 transition-all">
                Start Now!
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
    </>
  );
};

export default Home;