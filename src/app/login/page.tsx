"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate an API call
      console.log("Logging in with", { email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100'>
      <form
        onSubmit={handleLogin}
        className='w-full max-w-md bg-white p-8 rounded-2xl shadow-lg'>
        <h2 className='text-3xl font-bold mb-6 text-center'>Login</h2>

        {error && <p className='text-red-500 mb-4 text-sm'>{error}</p>}

        <input
          type='email'
          placeholder='Email'
          className='w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type='password'
          placeholder='Password'
          className='w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className='w-full bg-[#1e3a5f] hover:bg-[#1e3a5fef] text-white p-3 rounded-lg font-semibold transition'>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
