'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const loginAs = async (role: 'admin' | 'doctor' | 'patient') => {
    setIsLoading(true);
    const credentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      doctor: { email: 'doctor@example.com', password: 'doctor123' },
      patient: { email: 'patient@example.com', password: 'patient123' },
    }[role];

    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        alert('Invalid credentials');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        alert('Invalid credentials');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      alert('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to access your health records
          </p>
        </div>

        <div className="mt-10">
          <div className="bg-white shadow-lg ring-1 ring-slate-900/5 sm:rounded-2xl p-8 backdrop-blur-sm backdrop-filter">
            <div className="space-y-6">
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => loginAs('admin')}
                  className="group relative w-full flex items-center justify-center h-14 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg"
                >
                  <span className="absolute left-6 transition-transform duration-200 ease-in-out transform group-hover:-translate-x-1">
                    <ShieldCheckIcon className="h-6 w-6" />
                  </span>
                  <span className="ml-8">
                    {isLoading ? 'Loading...' : 'Login as Admin'}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => loginAs('doctor')}
                  className="group relative w-full flex items-center justify-center h-14 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md hover:shadow-lg"
                >
                  <span className="absolute left-6 transition-transform duration-200 ease-in-out transform group-hover:-translate-x-1">
                    <HeartIcon className="h-6 w-6" />
                  </span>
                  <span className="ml-8">
                    {isLoading ? 'Loading...' : 'Login as Doctor'}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => loginAs('patient')}
                  className="group relative w-full flex items-center justify-center h-14 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-md hover:shadow-lg"
                >
                  <span className="absolute left-6 transition-transform duration-200 ease-in-out transform group-hover:-translate-x-1">
                    <UserCircleIcon className="h-6 w-6" />
                  </span>
                  <span className="ml-8">
                    {isLoading ? 'Loading...' : 'Login as Patient'}
                  </span>
                </button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 py-1 bg-white text-gray-500 text-base font-medium rounded-full shadow-sm">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center h-12 px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-md hover:shadow-lg"
                >
                  {isLoading ? 'Loading...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
