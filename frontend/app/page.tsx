import React from 'react'
import Link from 'next/link'

const Home = () => {
  const homeBackground = {
    backgroundImage: "url('/home_background.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
  }
  return (
    <main style={homeBackground} className='grid grid-cols-3 gap-4 sm: '>
      <div className='items-center col-span-2 px-20 py-40'>
        <div className='grid grid-rows-6 grid-flow-col gap-4'>
          <div className='row-start-6'>
            <div className='grid grid-cols-2 gap-4'>
              <Link href="/customer">
                <button className='btn btn-primary w-full text-xl text-white bg-lightPink border-none hover:bg-pink-900'>Customer</button>
              </Link>
              <Link href="/business/login">
                <button className='btn btn-primary w-full text-xl text-white bg-lightPurple3 border-none hover:bg-purple-900'>Business Owner</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home