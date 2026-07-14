import React, { useState, useEffect } from 'react';

export default function LoginModal({ onUnlock }) {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if a master password hash is already registered in local sandbox storage
    const hasHash = localStorage.getItem('pm_vault_hash');
    setIsFirstTime(!hasHash);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Password string parameter cannot be empty.');
      return;
    }

    if (isFirstTime) {
      // Setup Flow Validation
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Security rule violation: Passphrase must be at least 6 characters.');
        return;
      }

      try {
        // Compute a non-reversible validation verification hash string using native Web Crypto SHA-256
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Store validation flag safely on disk for offline comparison match runs
        localStorage.setItem('pm_vault_hash', hashHex);
        onUnlock(password);
      } catch (err) {
        setError('Cryptographic engine initialization fault.');
      }
    } else {
      // Login Flow Validation
      try {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const storedHash = localStorage.getItem('pm_vault_hash');

        if (hashHex === storedHash) {
          onUnlock(password);
        } else {
          setError('Invalid master passphrase token configuration.');
        }
      } catch (err) {
        setError('Authentication verification pipeline failure.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xl animate-fade-in">
      {/* Structural Ambient Background Glow Accent */}
      <div className="absolute h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-md relative z-10">
        <div className="flex flex-col items-center mb-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white shadow-xl shadow-indigo-600/20 mb-3">🧠</span>
          <h2 className="text-xl font-extrabold tracking-tight text-white">
            {isFirstTime ? 'Create Private Vault' : 'Unlock Your Second Brain'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
            {isFirstTime 
              ? 'Set a local master password. Your data never leaves this machine.' 
              : 'Enter your master key to decrypt your sandboxed local storage files.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xxs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Master Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-200 placeholder-zinc-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {isFirstTime && (
            <div>
              <label className="block text-xxs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-200 placeholder-zinc-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-2.5 text-center text-xs text-rose-400 font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/10 mt-2"
          >
            {isFirstTime ? 'Initialize Secure Vault' : 'Open Vault Gateway'}
          </button>
        </form>
      </div>
    </div>
  );
}