'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    const pathname = usePathname()

    return (
        <div className='navbar fixed z-50 bg-darkPurple max-w-full'>
            <div className='flex-1'>
                <Link href="/"><Image src="/logo.png" width={120} height={120} alt='logo'></Image></Link>
            </div>
            <div className='flex-none mr-2'>

            </div>
        </div>
    )
}