"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/authProvider';

const BusinessPage = () => {
    const auth = useAuth()
    const router = useRouter()

    // Redirect if the user is not authenticated
    useEffect(() => {
      if (!auth.isAuthenticated) {
          router.replace('/business/login')
      }
    }, [auth.isAuthenticated, router])

    return (
        <h1>Business Page</h1>
    )

}

export default BusinessPage;