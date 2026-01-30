'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/api';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="mb-8 border-b border-gray-300 dark:border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-center md:text-left">
        <Link href="/" className="text-3xl font-bold text-gray-800 dark:text-white hover:text-gray-600 transition">
          A Grande Família Blog
        </Link>
      </div>

      <div className="flex gap-4 items-center w-full md:w-auto justify-center">
        {user ? (
          <>
            <Link 
              href="/family"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 text-sm font-medium transition"
            >
              Ver Árvore
            </Link>

            {user.role === 'ADMIN' && (
              <Link 
                href="/admin/family"
                className="bg-amber-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-amber-600 transition shadow-sm"
              >
                Painel Admin
              </Link>
            )}
            
            <Link 
              href="/posts/new"
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition"
            >
              Novo Post
            </Link>

            <button onClick={handleLogout} className="text-red-600 text-sm hover:underline">Sair</button>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">Login</Link>
        )}
      </div>
    </header>
  );
}