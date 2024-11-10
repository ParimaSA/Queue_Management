"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useSession } from "next-auth/react";
import BusinessPage from './ShowEntry'
import BusinessNavbar from './components/BusinessNavbar'

const Business = () => {
  const auth = useAuth()
  const router = useRouter()
  const { data: session, status } = useSession();
  
  // Redirect if the user is not authenticated
  useEffect(() => {
    if (status === "authenticated"){
      auth.login()
    }
    if (!auth.isAuthenticated && status === "unauthenticated") {
        router.replace('/business/login')
    }
  }, [auth, status, router])

  return (
    <main>
        <BusinessNavbar/>
        <div className='pt-24 bg-cream2'>
          <BusinessPage/>
        </div>
    </main>
  )
}

export default Business