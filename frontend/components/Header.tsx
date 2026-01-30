'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/api';

export function Header() {
  const router = useRouter();
  // Atualizado para incluir a Role no estado
  const [user, setUser] = useState<{ name: string; role?: string } | null>(null);

  useEffect(() => {
    // Hidratação: Pega os dados do usuário salvos no navegador ao carregar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Chama backend para destruir o Cookie HttpOnly
      await fetch(`${API_URL}/auth/logout`, { 
          method: 'POST',
          credentials: 'include' 
      });
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
    
    // 2. Limpa estado local do navegador e redireciona
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    router.refresh(); // Força atualização dos Server Components
  };

  return (
    <header className="mb-8 border-b border-gray-300 dark:border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
      
      {/* Branding */}
      <div className="text-center md:text-left">
        <Link href="/" className="text-3xl font-bold text-gray-800 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition">
          A Grande Família Blog
        </Link>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Compartilhe seu dia a dia com o mundo e a família! 
        </p>
      </div>

      {/* Área do Usuário / Login */}
      <div className="flex gap-4 items-center w-full md:w-auto justify-center">
        {user ? (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              Olá, <strong>{user.name}</strong>
            </span>

            {/* BOTÃO EXCLUSIVO ADMIN: Acesso à Árvore Genealógica */}
            {user.role === 'ADMIN' && (
              <Link 
                href="/admin/family"
                className="bg-amber-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-amber-600 transition shadow-sm"
              >
                Árvore
              </Link>
            )}
            
            <Link 
              href="/posts/new"
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition"
            >
              Novo Post
            </Link>

            <button 
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 text-sm hover:underline"
            >
              Sair
            </button>
          </>
        ) : (
          <Link 
            href="/login" 
            className="w-full md:w-auto text-center bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
          >
            Login / Cadastro
          </Link>
        )}
      </div>
    </header>
  );
}