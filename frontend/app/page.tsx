import React from 'react'
import Link from 'next/link'
import {fredoka} from "./fonts/fonts";
const Home = () => {
  return (
    <>
    <main className="flex flex-col min-h-screen lg:p-20 md:p-15 sm:p-10 lg:py-40 md:py-32 sm:py-20 lg:px-32 md:px-20 sm:px-10 bg-cream2">
        <div className={`${fredoka.className} antialiased`}>
          <h1 className="lg:text-8xl md:text-6xl sm:text-5xl font-bold text-darkPink text-left">Queue</h1>
          <h1 className="lg:text-8xl md:text-6xl sm:text-5xl font-bold text-lightGreen3 text-left lg:mt-4">Management</h1>
          <p className="lg:text-3xl md:text-2xl sm:text-2xl text-darkGreen lg:mt-8 text-left">
            You can choose your role to start using our website
          </p>
          <div className='lg:grid lg:grid-cols-2 lg:gap-4 lg:mt-14 md:grid md:grid-cols-2 md:gap-4 md:mt-14'>
             <Link href="/customer">
                <button className='btn btn-primary w-full text-xl text-white bg-lightPink2 border-none hover:bg-pink-900 sm:mt-3 md:mt-0 lg:mt-0'>Customer</button>
              </Link>
              <Link href="/business/login">
                <button className='btn btn-primary w-full text-xl text-white bg-lightPurple8 border-none hover:bg-purple-900 sm:mt-3 md:mt-0 lg:mt-0'>Business Owner</button>
              </Link>
          </div>
        </div>
    </main>
    </>
  )
}

export default Home