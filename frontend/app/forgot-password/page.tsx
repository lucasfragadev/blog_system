'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/app/config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Chamada para a rota pública de recuperação
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Mensagem de sucesso amigável
        setMessage({ 
          type: 'success', 
          text: 'Se este e-mail estiver cadastrado, você receberá um link em breve.' 
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao processar solicitação.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recuperar Senha</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Enviaremos um link de redefinição para o seu e-mail.
        </p>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2 dark:text-gray-300">
            Seu E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Solicitar Link'}
        </button>
      </form>

      <footer className="mt-8 text-center border-t border-gray-100 dark:border-gray-800 pt-6">
        <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">
          ← Voltar para o Login
        </Link>
      </footer>
    </div>
  );
}