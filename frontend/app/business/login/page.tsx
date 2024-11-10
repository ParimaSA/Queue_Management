"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
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
      <form onSubmit={handleSubmit} 
      className="flex flex-col grid gird-cols-7 gap-4 pt-40" style={loginBackground}>
        
        {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
        
        <div className='grid grid-cols-8 gap-4'>
          <div className='col-start-2 col-span-3 flex flex-col mt-12'>
            <label className='text-4xl text-center text-darkPurple2 font-bold ml-16'>Login</label>
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
              <label>Does not have an account?</label>
              <Link href='/business/signup' className='text-blue-500 hover:underline'>Sign up</Link>
            </div>
          </div>
        </div>
      </form>
    );
};

export default LoginForm;