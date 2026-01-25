'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificamos "user" em vez de "token", pois o token agora é invisível
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
      const res = await fetch('http://localhost:3000/api/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
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
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Criar nova publicação</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: Como configurar Docker com Node.js"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea
              required
              rows={8}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Escreva seu conteúdo aqui..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Publicando...' : 'Publicar Conteúdo'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}