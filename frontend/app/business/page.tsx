"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useSession } from "next-auth/react";
import BusinessPage from './ShowEntry'
import BusinessNavbar from './components/BusinessNavbar'
import ApiProxy from '../api/proxy';

const Business = () => {
  const auth = useAuth()
  const router = useRouter()
  const { status } = useSession();
  
  // Redirect if the user is not authenticated
  useEffect(() => {
    if (status === "authenticated"){
      auth.login()
    }
    if (!auth.isAuthenticated && status === "unauthenticated") {
        router.replace('/business/login')
    }
  }, [auth, status, router])

  // Redirect if the token is expired
  useEffect(() => {
    async function checkAuth() {
      const headers = await ApiProxy.getHeaders(true);
      if (headers.redirectToLogin === "true") {
        auth.logout()
      }
    }
    checkAuth();
  }, [auth, router]);

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