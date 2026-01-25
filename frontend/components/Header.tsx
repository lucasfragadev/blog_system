'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/v1/auth/logout', { 
          method: 'POST',
          credentials: 'include' 
      });
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }

    localStorage.removeItem('user');

    setUser(null);
    router.push('/login');
    router.refresh(); 
  };

  return (
    <header className="mb-8 border-b border-gray-300 pb-4 flex justify-between items-center">
      <div>
        <Link href="/" className="text-3xl font-bold text-gray-800 hover:text-gray-600">
          Blog de Estudos
        </Link>
        <p className="text-gray-500 mt-1 text-sm">Conteúdos para quem constrói a web.</p>
      </div>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-sm text-gray-600 hidden sm:block">
              Olá, <strong>{user.name}</strong>
            </span>
            
            <Link 
              href="/posts/new"
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition"
            >
              Novo Post
            </Link>

            <button 
              onClick={handleLogout}
              className="text-red-600 text-sm hover:underline"
            >
              Sair
            </button>
          </>
        ) : (
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
          >
            Login / Cadastro
          </Link>
        )}
      </div>
    </header>
  );
}