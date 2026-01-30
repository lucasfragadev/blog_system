import { Header } from '@/components/Header';
import { LikeButton } from '@/components/LikeButton';
import { API_URL } from '@/app/config/api';
import { cookies } from 'next/headers';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
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

async function getPosts(): Promise<Post[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Cookie'] = `token=${token.value}`;
      headers['Authorization'] = `Bearer ${token.value}`;
    }

    const res = await fetch(`${API_URL}/posts`, { 
      cache: 'no-store',
      headers
    });

    if (!res.ok) throw new Error('Falha ao buscar posts');

    return res.json();
  } catch (error) {
    console.error("Erro de conexão:", error);
    return [];
  }
}

function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/#+\s?/g, '')       
    .replace(/\*\*/g, '')        
    .replace(/__/g, '')          
    .replace(/\*/g, '')          
    .replace(/`/g, '')           
    .replace(/>\s?/g, '')        
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') 
    .replace(/\n/g, ' ');        
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen max-w-4xl mx-auto p-6">
      <Header />

      <section className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 text-center text-gray-500">
            <p>Nenhum post encontrado.</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block">
              <article 
                className="group p-5 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer h-full"
              >
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="font-medium text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded">
                    {post.author?.name || 'Anônimo'}
                  </span>
                  <span>•</span>
                  {/* Data formatada com hora */}
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {stripMarkdown(post.content)}
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                  <LikeButton 
                    postId={post.id} 
                    initialLikes={post.likeCount || 0} 
                    initialLiked={post.isLiked || false} 
                  />
                  <span className="text-xs text-gray-400 hover:text-blue-500 transition">
                    Ler mais →
                  </span>
                </div>
              </article>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}