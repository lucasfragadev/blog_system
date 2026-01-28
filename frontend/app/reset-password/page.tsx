'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validação local (mesma regra do seu backend)
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres e um símbolo especial.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando...' });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao redefinir senha.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6 text-center dark:text-gray-100">
        <h1 className="text-xl font-bold">Token inválido ou ausente. 😕</h1>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Redefinir Senha</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nova Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirmar Nova Senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>

        {message.text && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}

// O Next.js exige Suspense ao usar useSearchParams em páginas estáticas
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-12">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}