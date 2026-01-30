import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { cookies } from 'next/headers'; 
import { PostActions } from '@/components/PostActions';
import { CommentsSection } from '@/components/CommentsSection';
import { LikeButton } from '@/components/LikeButton';
import { API_URL } from '@/app/config/api';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: {
    name: string;
  };
  likeCount: number;
  isLiked: boolean;
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

async function getPost(id: string): Promise<Post | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Cookie'] = `token=${token.value}`;
    }
   
    const res = await fetch(`${API_URL}/posts/${id}`, {
      cache: 'no-store',
      headers: headers, 
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center dark:text-gray-100">
        <h1 className="text-2xl font-bold mb-2">Post não encontrado 😕</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 my-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
      
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition flex items-center gap-1">
          ← Voltar para a lista
        </Link>
      </div>

      <header className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
            {post.author?.name || 'Autor Desconhecido'}
          </span>
          <span>•</span>
          {/* Data e Hora formatadas */}
          <time>{formatDate(post.createdAt)}</time>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          {post.title}
        </h1>
      </header>

      <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      <div className="flex items-center justify-between border-t border-b border-gray-100 dark:border-gray-800 py-4 my-6">
        <div className="flex items-center gap-4">
            <LikeButton 
                postId={post.id} 
                initialLikes={post.likeCount || 0} 
                initialLiked={post.isLiked || false} 
            />
        </div>
         <div className="flex gap-2">
            <PostActions postId={post.id} authorId={post.authorId || ''} />
         </div>
      </div>

      <CommentsSection postId={post.id} />
    </main>
  );
}