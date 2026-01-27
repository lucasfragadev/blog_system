'use client';

import { API_URL } from '@/app/config/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  postId: string;
  authorId: string;
}

export function PostActions({ postId, authorId }: Props) {
  const router = useRouter();
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  // Verificação de Permissões no CLIENT SIDE (UX)
  // Nota: A segurança real está no Backend. Aqui é apenas para esconder botões inúteis.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      // Regra 1: O dono do post pode tudo
      if (user.id === authorId) {
        setCanEdit(true);
        setCanDelete(true);
      }
      
      // Regra 2: Admin pode moderar (apagar), mas não editar conteúdo alheio
      if (user.role === 'ADMIN') {
        setCanDelete(true); 
      }
    }
  }, [authorId]);

  if (!canEdit && !canDelete) return null;

  const handleDelete = async () => {
    const confirm = window.confirm('Tem certeza que deseja excluir este post?');
    if (!confirm) return;

    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include', // Envia cookie para o Backend validar se sou Dono ou Admin
      });

      if (res.ok) {
        alert('Post excluído com sucesso!');
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Erro ao excluir');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão.');
    }
  };

  return (
    <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
      
      {canEdit && (
        <button 
          onClick={() => router.push(`/posts/${postId}/edit`)}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          Editar Post
        </button>
      )}
      
      {canDelete && (
        <button 
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
        >
          Excluir Post
        </button>
      )}
    </div>
  );
}