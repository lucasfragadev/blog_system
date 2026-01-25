'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.id as string; 

  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true); 
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Efeito para carregar os dados originais do Post
  useEffect(() => {
    if (!id) return;

    const fetchOriginalPost = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/posts/${id}`, {
          cache: 'no-store'
        });

        if (!res.ok) throw new Error('Falha ao carregar dados do post');

        const post = await res.json();

        // CORREÇÃO: Pegamos o objeto 'user' completo, conforme salvo no Login
        const storedUser = localStorage.getItem('user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        // Verifica se é o dono do post
        if (!currentUser || currentUser.id !== post.authorId) {
          alert('Você não tem permissão para editar este post.');
          router.push('/');
          return;
        } // <--- AQUI FALTAVA FECHAR A CHAVE

        // Preenche o formulário com o que veio do banco se passar na verificação
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

  // 2. Função de Salvar (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/v1/posts/${id}`, {
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
    return <div className="text-center p-10 text-gray-500">Carregando dados...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Publicação</h1>

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
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo (Markdown)</label>
            <textarea
              required
              rows={8}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
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