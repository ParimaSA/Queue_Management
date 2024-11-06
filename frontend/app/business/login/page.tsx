"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signIn, useSession } from "next-auth/react";
import { useEffect } from 'react';
import Link from 'next/link';

interface FormData {
    username: string;
    password: string;
}

const LoginForm: React.FC = () => {
  const auth = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  // Redirect if the user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
        router.replace('/business')
    }
  }, [auth.isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            auth.login()
            router.replace('/business')
        } catch (err) {
            setError((err as Error).message); // Set error message to state
        }
    };
    const loginBackground = {
      backgroundImage: "url('/login_background.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
    }

    return (
//         <Navbar/>
      <form onSubmit={handleSubmit}
      className="flex flex-col grid gird-cols-7 gap-4 pt-40" style={loginBackground}>
        
        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        
        <div className='grid grid-cols-8 gap-4'>
          <div className='col-start-2 col-span-3 flex flex-col mt-12'>
            <label className='text-4xl text-center text-darkPurple2 font-bold ml-16'>Login</label>
            <button onClick={() => signIn("google")} className='btn btn-primary w-auto ml-20 mt-8 bg-white text-black text-base border-none hover:bg-purple-300'>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 50 40"
                fill="currentColor"
                className="h-5 w-5 opacity-70">
              <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>Sign in with Google</button>
            <div className="flex items-center justify-center ml-16 mt-8">
              <hr className="w-1/2 border-gray-300" />
              <span className="px-4 text-gray-500 text-1xl">OR</span>
              <hr className="w-1/2 border-gray-300" />
            </div>
            <div className='pt-7'/>
              <div className="input input-bordered flex items-center gap-2 ml-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
              </svg>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Username"
              />
            </div>
            <div className='pt-8'/>
            <div className="input input-bordered flex items-center gap-2 ml-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
              />
            </div>
            <div className='pt-12'/>
            <button type="submit" className='btn btn-primary w-auto rounded-full ml-20 bg-darkPurple2 text-white text-base border-none hover:bg-purple-900'>Login</button>
            <div className='pt-7'/>
            <div className='flex items-center space-x-2 ml-20'>
              <label>Does't have an account?</label>
              <Link href='/business/signup' className='text-blue-500 hover:underline'>Sign up</Link>
            </div>
          </div>
        </div>
      </form>
    );
};

export default LoginForm;