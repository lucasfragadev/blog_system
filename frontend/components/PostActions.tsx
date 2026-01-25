'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  postId: string;
  authorId: string;
}

export function PostActions({ postId, authorId }: Props) {
  const router = useRouter();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.id === authorId) {
        setCanEdit(true);
      }
    }
  }, [authorId]);

  if (!canEdit) return null;

  const handleDelete = async () => {
    const confirm = window.confirm('Tem certeza que deseja excluir este post?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
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
    <div className="flex gap-4 mt-8 pt-8 border-t border-gray-100">
      <button 
        onClick={() => router.push(`/posts/${postId}/edit`)}
        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
      >
        Editar Post
      </button>
      
      <button 
        onClick={handleDelete}
        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
      >
        Excluir Post
      </button>
    </div>
  );
}