"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from "react-toastify";
import { fredoka } from '@/app/fonts/fonts';

interface FormData {
    username: string;
    password1: string;
    password2: string;
    business_name: string;
}

interface ErrorMessage {
  error: string;
}

const SignUpForm = () => {
    const router = useRouter()
    const [formData, setFormData] = useState<FormData>({ username: '', business_name: '', password1: '', password2: ''});
    const [error, setError] = useState<string | null>(null);

    const alert_success = () => {
        toast.success("Successfully create your account.")
    }

    const alert_error = (errorMessage: ErrorMessage) => {
        const errorData = JSON.parse(errorMessage.error)
        const firstErrorKey = Object.keys(errorData)[0]
        const msg = errorData[firstErrorKey][0].message
        toast.error(msg)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json()
            console.log("DATA: ", data)
            if (data.error) {
                alert_error(data)
            } else {
                alert_success();
                router.replace('/business/login');
            }
        } catch (err) {
            console.log("Catch the error")
            setError((err as Error).message);
        }
    };
      
  return (
    <div className='flex justify-center items-center min-h-screen'
        style={{ backgroundImage: `url('/register.png')`, backgroundSize: 'cover' }}
    >
        <div className="card bg-white lg:w-[60vw] md:w-[50vw] sm:w-[50vw] h-[80vh] shadow-xl flex justify-center items-center">
          <div className="card-body flex flex-col justify-center items-center">
            <div className={`${fredoka.className} text-center flex flex-col justify-center items-center`}>
                <h1 className="text-4xl md:text-5xl text-green5 font-extrabold">
                  Sign Up
                </h1>
                <p className="mt-4 text-lg text-gray-600">Enter your details to create your account</p>
            </div>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500">{error}</p>}
              <div className='pt-7'/>
                <div className="input input-bordered flex items-center gap-2 lg:w-[40vw] md:w-[40vw] sm:w-[30vw]">
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
                  <label className="input input-bordered flex items-center gap-2 lg:w-[40vw] md:w-[40vw] sm:w-[30vw]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                    </svg>
                    <input
                      type="text"
                      id="business_name"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      required
                      placeholder="Business Name"
                    />
                  </label>
                <div className='pt-8'/>
                <div className="input input-bordered flex items-center gap-2 lg:w-[40vw] md:w-[40vw] sm:w-[30vw]">
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
                    id="password1"
                    name="password1"
                    value={formData.password1}
                    onChange={handleChange}
                    required
                    placeholder="Password"
                  />
                </div>
                <div className='pt-8'/>
                <div className="input input-bordered flex items-center gap-2 lg:w-[40vw] md:w-[40vw] sm:w-[30vw]">
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
                    id="password2"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                    placeholder="Confirm Password"
                  />
                </div>    
                <div className='pt-8'/>
                <button type="submit" className='btn btn-primary lg:w-[40vw] md:w-[40vw] sm:w-[30vw] items-center rounded-full bg-purple text-white hover:bg-purple2 border-none'>
                  Sign up
                </button>
                <div className='pt-6'/>
                <div className='space-x-3'>
                  <label className='text-black'>Already have an account?</label>
                  <Link href='/business/login' className='text-darkPink hover:underline'>Login</Link>
                </div>
            </form>
          </div>
        </div>
      </div>
    );
};

export default SignUpForm