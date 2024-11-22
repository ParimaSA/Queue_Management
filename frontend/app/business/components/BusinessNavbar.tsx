'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function BusinessNavbar() {

    return (
        <div className='navbar fixed z-50 bg-darkPurple max-w-full'>
            <div className='flex-1'>
                <Link href="/"><Image src="/logo.png" width={120} height={120} alt='logo'></Image></Link>
            </div>
            <div className='bg-white rounded-full w-11 h-11 flex items-center justify-center'>
                <Link href="/business">
                <button className="btn bg-transparent border-none p-0">  
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                </button>
                </Link>
            </div>
            <div className='flex-none mr-2 ml-3'>
                <ul className='btn menu menu-horizontal px-1 bg-white rounded-full h-10 flex justify-center items-center'>
                    <li>
                        <details>
                            <summary className='font-bold flex items-center justify-center h-full'>Account</summary>
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