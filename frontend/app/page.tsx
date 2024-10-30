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
    <main style={homeBackground} className='grid grid-cols-3 gap-4'>
      <div className='items-center col-span-2 px-20 py-40'>
          <h1 className='text-7xl font-bold'>Queue</h1>
          <h1 className='text-7xl font-bold'>Management</h1>
          <br></br>
          <h1 className='text-2xl'>You can choose your role to start using our website</h1>
          <br></br>
          <div className='grid grid-cols-2 gap-4'>
            <Link href="/customer/login">
              <button className='btn btn-primary w-full'>Customer</button>
            </Link>
            <Link href="/business/login">
              <button className='btn btn-primary w-full'>Business Owner</button>
            </Link>
          </div>
      </div>
    </main>
  )
}

export default Home