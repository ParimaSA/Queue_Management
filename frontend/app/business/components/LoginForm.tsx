"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { toast } from "react-toastify";
import Link from 'next/link';
import { fredoka } from '@/app/fonts/fonts';

interface FormData {
    username: string;
    password: string;
}

export default function LoginForm() {
  const auth = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });

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
            toast.error((err as Error).message)
        }
    };


    return (
      <form onSubmit={handleSubmit}>
        <div className='pt-7'/>
            <div className="input input-bordered flex items-center gap-2">
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
        <div className="input input-bordered flex items-center gap-2">
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
        <div className='pt-8'/>
        <div className={`${fredoka.className} text-center flex flex-col justify-center items-center`}>
            <button type="submit" className='btn btn-primary lg:w-[40vw] md:w-[40vw] sm:w-[30vw] items-center rounded-full bg-gradient-to-r from-green3 to-green2 text-white hover:bg-darkGreen border-none text-xl'>Login</button>
        </div>
        <div className='pt-7'/>
        <div className='flex items-center space-x-2'>
            <label>Does not have an account?</label>
            <Link href='/business/signup' className='text-blue-500 hover:underline'>Sign up</Link>
        </div>
      </form>
    );
};