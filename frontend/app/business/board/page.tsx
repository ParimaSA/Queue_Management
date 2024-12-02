"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import useSWR from "swr";
import BusinessNavbar from "../components/BusinessNavbar";
import fetcher from "@/lib/fetcher";
import ApiProxy from "@/app/api/proxy";
import LoadingSpinner from "../components/LoadingSpinner";
import QueueBox from "../components/QueueBox";

const LAST_ENTRY_API_URL = "/api/business/queues/last_entry";

interface Queue {
  name: string;
  last_entry: string;
}

const BoardPage = () => {
  const { data: boardData, error: boardDataError } = useSWR<Queue[]>(
    LAST_ENTRY_API_URL,
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
    }
  );

  const auth = useAuth();
  const router = useRouter();

  // Redirect if the token is expired
  useEffect(() => {
    async function checkAuth() {
      const headers = await ApiProxy.getHeaders(true);
      if (headers.redirectToLogin === "true") {
        auth.logout();
        router.push("/login");
      }
    }
    checkAuth();
  }, [auth, router]);

  return (
    <>
      <BusinessNavbar />
      <div className="pt-24 bg-cream2 text-center">
        {(!boardData && !boardDataError) ? (
          <LoadingSpinner />
        ) : boardDataError ? (
          <div className="flex items-center justify-center h-[70vh]">
            <h1 className="text-2xl text-red-500">Failed to load queue data.</h1>
          </div>
        ) : boardData?.length ? (
          <div className="mt-10">
            <h1 className="mt-10 font-bold text-4xl">Queue Board</h1>
            <div className="ml-10 mr-10 mt-20">
              <QueueBox queues={boardData}/>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[70vh]">
            <h1 className="text-2xl text-gray-400">No queue in this business</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default BoardPage;
