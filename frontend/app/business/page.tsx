"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import BusinessPage from './ShowEntry'
import BusinessNavbar from './components/BusinessNavbar'

const Business = () => {
  const auth = useAuth()
  const router = useRouter()

  // Redirect if the user is not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) {
        router.replace('/business/login')
    }
  }, [auth.isAuthenticated, router])

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