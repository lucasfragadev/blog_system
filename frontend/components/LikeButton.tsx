'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/api';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
}

export function LikeButton({ postId, initialLikes, initialLiked }: LikeButtonProps) {
  const router = useRouter();
  
  // Estado local para Optimistic UI (Feedback Instantâneo)
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleToggleLike = async (e: React.MouseEvent) => {
    // Previne que o clique no botão dispare o Link do card (Bubbling)
    e.preventDefault();
    e.stopPropagation();

    // 1. Verificação de UX: Se não tem usuário no storage, manda logar antes de tentar a API
    const user = localStorage.getItem('user');
    if (!user) {
      if (confirm('Você precisa estar logado para curtir. Deseja fazer login?')) {
        router.push('/login');
      }
      return;
    }

    if (loading) return;

    // 2. Optimistic Update: Atualiza a tela ANTES da resposta do servidor
    // Isso faz a aplicação parecer instantânea para o usuário
    const previousLiked = liked;
    const previousCount = count;

    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setLoading(true);

    try {
      // 3. Request em Background
      const res = await fetch(`${API_URL}/likes/post/${postId}`, {
        method: 'POST',
        credentials: 'include', // Obrigatório para enviar o Cookie de sessão
      });

      if (!res.ok) {
        throw new Error('Erro ao curtir');
      }
    
    } catch (error) {
      console.error(error);
      // 4. Rollback: Se a API falhar, desfazemos a mudança visual (Confiabilidade)
      setLiked(previousLiked);
      setCount(previousCount);
      alert('Não foi possível realizar a ação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleLike}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-200 group
        ${liked 
          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
        }
      `}
      title={liked ? "Descurtir" : "Curtir"}
    >
      {/* Ícone SVG inline para evitar dependências externas */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`w-5 h-5 transition-transform duration-200 ${liked ? 'scale-110' : 'group-hover:scale-110'}`}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>

      <span className={`text-sm font-medium ${liked ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {count}
      </span>
    </button>
  );
}