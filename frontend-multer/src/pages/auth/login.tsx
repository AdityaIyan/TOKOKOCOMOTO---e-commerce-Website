import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">Login</h1>
          <p className="text-gray-500 text-sm uppercase tracking-wide">Welcome back</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 mb-6 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-xs font-bold uppercase tracking-widest mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full border-b border-gray-300 py-3 px-2 focus:outline-none focus:border-black transition-colors bg-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full border-b border-gray-300 py-3 px-2 focus:outline-none focus:border-black transition-colors bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-black font-bold hover:text-gray-600 transition-colors uppercase tracking-wide text-xs ml-1">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}