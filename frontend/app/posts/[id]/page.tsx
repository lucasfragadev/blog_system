import ReactMarkdown from 'react-markdown';
import { PostActions } from '@/components/PostActions';
import { CommentsSection } from '@/components/CommentsSection';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
  authorId: string;
}

// 1. Função para buscar UM post pelo ID
async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`http://127.0.0.1:3000/api/v1/posts/${id}`, {
      cache: 'no-store', // Garante dados frescos
    });

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

// 2. O Componente da Página
interface Props {
  // No Next.js 15/16, params é uma Promise que precisa ser aguardada
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Props) {
  // Await nos parâmetros (obrigatório nas versões novas)
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Post não encontrado 😕</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto p-6 bg-white my-8 rounded-xl shadow-sm border border-gray-200">
      
      {/* Botão de Voltar */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition flex items-center gap-1">
          ← Voltar para a lista
        </Link>
      </div>

      {/* Cabeçalho do Artigo */}
      <header className="mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
            {post.author?.name || 'Autor Desconhecido'}
          </span>
          <span>•</span>
          <time>{new Date(post.createdAt).toLocaleDateString()}</time>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {post.title}
        </h1>
      </header>

      {/* CONTEÚDO DO ARTIGO (Markdown)
         A classe "prose" faz toda a mágica de estilização automática 
      */}
      <article className="prose prose-lg prose-slate max-w-none prose-headings:text-gray-800 prose-a:text-blue-600">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>

      <PostActions postId={post.id} authorId={post.authorId || ''} />

      <CommentsSection postId={post.id} />

    </main>
  );
}