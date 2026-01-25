'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
}

interface Props {
  postId: string;
}

export function CommentsSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. Carregar Comentários e Checar Login
  useEffect(() => {
    // Checa se tem usuário no localStorage
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    // Busca comentários
    fetch(`http://localhost:3000/api/v1/comments/post/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar comentários', err);
        setLoading(false);
      });
  }, [postId]);

  // 2. Enviar Comentário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <--- Importante: Envia o cookie de Auth
        body: JSON.stringify({ content: newComment, postId }),
      });

      if (!res.ok) throw new Error('Erro ao comentar');

      const savedComment = await res.json();

      // Adiciona o novo comentário no topo da lista visualmente
      setComments((prev) => [savedComment, ...prev]);
      setNewComment(''); // Limpa o campo

    } catch (error) {
      alert('Erro ao enviar comentário.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Comentários ({comments.length})
      </h3>

      {/* Formulário de Novo Comentário */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
            rows={3}
            placeholder="Deixe seu comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded text-center text-sm text-gray-600 mb-8 border border-gray-200">
          Você precisa estar logado para comentar.{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Fazer Login
          </Link>
        </div>
      )}

      {/* Lista de Comentários */}
      {loading ? (
        <p className="text-gray-500 text-sm">Carregando comentários...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm italic">Seja o primeiro a comentar!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar Simples (Inicial do nome) */}
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                {comment.author?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {comment.author?.name || 'Desconhecido'}
                  </span>
                  <span className="text-xs text-gray-400">
                    • {new Date(comment.createdAt).toLocaleDateString()} às {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}