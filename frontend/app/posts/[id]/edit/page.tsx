'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_URL } from '@/app/config/api'; 

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.id as string; 

  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pattern "Fetch-then-Fill":
  // 1. Buscamos os dados atuais do post.
  // 2. Verificamos se o usuário pode editar (UX).
  // 3. Preenchemos o estado do formulário para edição.
  useEffect(() => {
    if (!id) return;

    const fetchOriginalPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
          cache: 'no-store'
        });

        if (!res.ok) throw new Error('Falha ao carregar dados do post');

        const post = await res.json();
        
        const storedUser = localStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        // Proteção Client-Side: Impede acesso visual, mas a proteção real é no Backend (PUT)
        if (!currentUser || currentUser.id !== post.authorId) {
          alert('Você não tem permissão para editar este post.');
          router.push('/');
          return;
        }

        setFormData({
          title: post.title,
          content: post.content
        });

      } catch (err) {
        setError('Não foi possível carregar o post original.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOriginalPost();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Método PUT para atualização completa
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao atualizar post');
      }

      alert('Post atualizado com sucesso!');
      router.push(`/posts/${id}`); 
      router.refresh(); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-500 dark:text-gray-400">Carregando dados...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-2xl border border-gray-200 dark:border-gray-800 transition-colors">
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Editar Publicação
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
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none
              dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conteúdo (Markdown)
            </label>
            <textarea
              required
              rows={8}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm
              dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors" 
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
              disabled={saving}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}