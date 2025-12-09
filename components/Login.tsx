import React, { useState } from 'react';
import { User } from '../types';
import { login } from '../services/authService';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to ScholarSync</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="e.g. alice"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          <p className="font-semibold mb-2 text-slate-800">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-mono bg-slate-200 px-1 rounded">admin</span> / <span className="font-mono bg-slate-200 px-1 rounded">password</span>
            </div>
            <div>
              <span className="font-mono bg-slate-200 px-1 rounded">alice</span> / <span className="font-mono bg-slate-200 px-1 rounded">password</span>
            </div>
            <div>
              <span className="font-mono bg-slate-200 px-1 rounded">bob</span> / <span className="font-mono bg-slate-200 px-1 rounded">password</span>
            </div>
            <div>
              <span className="font-mono bg-slate-200 px-1 rounded">charlie</span> / <span className="font-mono bg-slate-200 px-1 rounded">password</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;