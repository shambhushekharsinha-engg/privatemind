import React, { useState, useEffect } from 'react';
import { hashPassword } from '../utils/crypto';

export default function LoginModal({ onUnlock }) {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if a master password hash already exists in localStorage
    const savedHash = localStorage.getItem('pm_vault_hash');
    if (!savedHash) {
      setIsFirstTime(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Password cannot be blank.');
      return;
    }

    if (isFirstTime) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      const hash = await hashPassword(password);
      localStorage.setItem('pm_vault_hash', hash);
      onUnlock(password);
    } else {
      const inputHash = await hashPassword(password);
      const savedHash = localStorage.getItem('pm_vault_hash');

      if (inputHash === savedHash) {
        onUnlock(password);
      } else {
        setError('Incorrect Master Password. Access Denied.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl mb-2">🧠</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isFirstTime ? 'Create Private Vault' : 'Unlock PrivateMind'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 text-center">
            {isFirstTime 
              ? 'Set a local master password. Your data never leaves this machine.' 
              : 'Enter your master password to decrypt your offline database context.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Master Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isFirstTime && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white tracking-wide transition-colors hover:bg-indigo-500 focus:outline-none"
          >
            {isFirstTime ? 'Initialize Vault' : 'Unlock Database'}
          </button>
        </form>
      </div>
    </div>
  );
}