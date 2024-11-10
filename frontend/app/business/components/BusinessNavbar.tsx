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
            <div className='flex-none mr-2'>
                <ul className='btn menu menu-horizontal px-1 bg-white rounded-full h-10 flex justify-center items-center'>
                    <li>
                        <details>
                            <summary className='font-bold flex items-center justify-center h-full'>Account</summary>
                            <ul className='absolute left-0 bg-base-100 mt-2 rounded-lg p-2 shadow-md'>
                            <li>
                                <Link href="/profile">
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