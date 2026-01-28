'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/app/config/api'; // Ajuste o caminho conforme sua estrutura

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CRÍTICO: 'credentials: include' é obrigatório.
        // Ele instrui o navegador a aceitar e salvar o Cookie 'HttpOnly' (token) que o backend envia.
        // Sem isso, o login ocorre, mas a sessão não persiste.
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao entrar');
      }

      // Persistência de UI (User Interface):
      // Salvamos dados não-críticos (nome, role) no localStorage apenas para exibir no Header.
      // A segurança real (autenticação) está no Cookie, invisível ao JavaScript.
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login realizado com sucesso!');
      router.push('/');
      router.refresh(); // Garante que o Header atualize o estado de login

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    // Centralização vertical e horizontal com fundo adaptável ao tema
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">

      {/* Card de Login */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 w-full max-w-md transition-all">

        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          Acesse sua conta
        </h1>

        {/* Feedback de Erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded mb-4 text-sm border border-red-200 dark:border-red-800 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              // Inputs no Dark Mode precisam de fundo escuro (bg-gray-800) e borda sutil
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-400 transition-colors"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-blue-400 transition-colors"
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end mb-4">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-medium shadow-sm"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Não tem conta?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}