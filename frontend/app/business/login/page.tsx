"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { signIn } from "next-auth/react";
import LoginForm from '../components/LoginForm';
import { fredoka } from '@/app/fonts/fonts';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();

  // Redirect if the user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      auth.login();
      router.replace('/business');
    }
  }, [auth, router]);

  return (
    <>
      <div className='flex justify-center items-center min-h-screen bg-cream2'
           style={{ backgroundImage: `url('/register.png')`, backgroundSize: 'cover' }}
      >
        <div className="card bg-white lg:w-[60vw] md:w-[50vw] sm:w-[50vw] h-[90vh] lg:h-[80vh] md:h-[80vh] sm:h-[80vh]rounded-xl shadow-2xl flex justify-center items-center">
          <div className="card-body flex flex-col justify-center items-center px-8 py-10">
            <div className={`${fredoka.className} text-center flex flex-col justify-center items-center`}>
              <h1 className="text-4xl md:text-5xl text-darkPink font-extrabold">
                Welcome Back!
              </h1>
              <p className="mt-4 text-lg text-gray-600">Please login to your account to continue</p>
            </div>
            <button
              onClick={() => signIn("google")}
              className='btn btn-primary lg:w-[40vw] md:w-[40vw] sm:w-[40vw] mt-8 shadow-lg transform transition-all duration-300 bg-white text-black text-base border-none hover:bg-green4 hover:text-white'
            >
              <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 50 40"
              fill="currentColor"
              className="h-5 w-5 opacity-70">
              <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>Sign in with Google</button>
            <div className="flex items-center justify-center mt-8 w-full">
              <hr className="flex-grow border-darkPink border-t" />
              <span className="px-4 text-darkPink text-lg">OR</span>
              <hr className="flex-grow border-darkPink border-t" />
            </div>
            <LoginForm/>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;