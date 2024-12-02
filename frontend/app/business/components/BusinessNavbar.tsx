'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function BusinessNavbar() {

    return (
        <div className='navbar fixed z-50 bg-darkPink max-w-full'>
            <div className='flex-1'>
                <Link href="/"><Image src="/logo.png" width={120} height={120} alt='logo'></Image></Link>
            </div>
            <div className='bg-white rounded-full w-11 h-11 flex items-center justify-center'>
                <Link href="/business">
                <button className="btn bg-transparent border-none p-0">  
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                </button>
                </Link>
            </div>
            <div className='bg-white rounded-full w-11 h-11 ml-2 flex items-center justify-center'>
                <Link href="/business/board">
                <button className="btn bg-transparent border-none p-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                    </svg>
                </button>
                </Link>
            </div>
            <div className='flex-none mr-2 ml-3'>
                <ul className='btn menu menu-horizontal px-1 bg-white rounded-full h-10 flex justify-center items-center'>
                    <li>
                        <details>
                            <summary className='font-bold flex items-center justify-center h-full text-black'>Account</summary>
                            <ul className='absolute left-0 bg-base-100 mt-2 rounded-lg p-2 shadow-md'>
                            <li>
                                <Link href="/business/profile">
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link href="/business/logout">
                                    Logout
                                </Link>
                            </li>
                            </ul>
                        </details>
                    </li>
                </ul>
            </div>
        </div>
    )
}