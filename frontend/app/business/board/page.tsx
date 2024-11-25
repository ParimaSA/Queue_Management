"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import useSWR from "swr";
import BusinessNavbar from "../components/BusinessNavbar";
import fetcher from "@/lib/fetcher";
import ApiProxy from "@/app/api/proxy";
import LoadingSpinner from "../components/LoadingSpinner";

const LAST_ENTRY_API_URL = "/api/business/queues/last_entry";

interface Queue {
  queue: string;
  last_entry: string;
}

const BoardPage = () => {
  const { data: boardData, error: boardDataError } = useSWR<Queue[]>(
    LAST_ENTRY_API_URL,
    fetcher,
    {
      refreshInterval: 5000,
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
            <table className="mx-auto border-collapse border border-gray-300 bg-white w-full max-w-[80vw]">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-lightPink3">Queue</th>
                  <th className="border border-gray-300 px-4 py-2 bg-lightPink3">Entry</th>
                </tr>
              </thead>
              <tbody>
                {boardData.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 text-center text-xl font-bold">
                      {item.queue}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {item.last_entry}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
