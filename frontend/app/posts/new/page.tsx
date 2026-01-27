'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/api';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificação de UX (User Experience):
  // Redireciona usuários não logados antes mesmo de renderizar o formulário.
  // A segurança real está no Backend, mas isso evita frustração do usuário.
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Você precisa estar logado para postar.');
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Credentials Include: Essencial para que o browser envie o Cookie 'token'
        // junto com a requisição, permitindo que o Backend identifique o autor.
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        // Tratamento robusto de erros (tenta ler JSON, fallback para texto)
        let errorMessage = 'Erro ao criar post';
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Erro ${res.status}: ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setFormData({ title: '', content: '' });
      router.push('/');
      
      // Router Refresh: Força o Next.js a invalidar o cache da Home e buscar os posts novos.
      // Sem isso, o usuário voltaria para a Home e não veria o post novo imediatamente.
      router.refresh();

    } catch (error) {
      console.error('Erro ao publicar post:', error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro desconhecido ao publicar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-2xl border border-gray-200 dark:border-gray-800 transition-colors">
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Criar nova publicação
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
              placeholder="Ex: Como configurar Docker com Node.js"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conteúdo
            </label>
            <textarea
              required
              rows={8}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
              placeholder="Escreva seu conteúdo aqui..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Publicando...' : 'Publicar Conteúdo'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}