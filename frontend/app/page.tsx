import React from 'react';
import Link from 'next/link';
import { fredoka } from './fonts/fonts';

const Home = () => {
  return (
    <>
      <main className="flex flex-col justify-center items-center min-h-screen bg-cream2 lg:px-32 md:px-20 sm:px-10">
        <div className={`${fredoka.className} antialiased px-6 py-16 text-center flex flex-col justify-center items-center`}>
          <div className="bg-white shadow-lg rounded-3xl p-6 md:p-14 lg:p-16 relative w-full max-w-5xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-darkPink">
              Queue
              <span className="text-green3 block">Management</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl lg:text-2xl text-gray-700 font-medium">
              Keep your business organized and your customers happy with our queue management solution.
            </p>
            <div className="mt-12 flex justify-center">
              <Link href="/business/login">
                <button className="w-60 lg:w-72 px-8 py-4 text-lg font-semibold rounded-full bg-lightPurple8 text-white shadow-md hover:scale-105 transform transition-all duration-300">
                  Start Now!
                </button>
              </Link>
            </div>
          </div>

          <section className="w-full py-16 text-center">
            <h2 className="text-4xl font-bold text-lightPink4">Why Choose Our Solution?</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-600">Efficiency</h3>
                <p className="mt-4 text-lg text-gray-500">
                  Streamline your queue management to save time and increase efficiency in your operations.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-600">Customer Satisfaction</h3>
                <p className="mt-4 text-lg text-gray-500">
                  Ensure a smooth and pleasant experience for your customers with shorter wait times.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-600">Data Insights</h3>
                <p className="mt-4 text-lg text-gray-500">
                  Access real-time data to make informed decisions and improve your service delivery.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
