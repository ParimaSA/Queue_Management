"use client";

import { useAuth } from "@/components/authProvider";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

const LOGOUT_URL = "/api/logout/";

export default function Page(): JSX.Element {
    const router = useRouter();
    const auth = useAuth();

    useEffect(() => {
        async function handleLogout(): Promise<void> {
            const requestOptions: RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}), // Optional payload
            };

            try {
                const response = await fetch(LOGOUT_URL, requestOptions);
                
                if (response.ok) {
                    console.log("Logged out");
                    auth.logout();
                    router.replace('/business/login'); // Redirect to login
                } else {
                    console.error("Failed to log out");
                }
            } catch (error) {
                console.error("Error during logout:", error);
            }
        }

        handleLogout(); // Trigger logout when the page loads
    }, [auth, router]);

    return (
        <div className="h-[95vh] flex items-center justify-center">
            <p>Logging out...</p>
        </div>
    );
}