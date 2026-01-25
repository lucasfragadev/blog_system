import { Header } from '@/components/Header';
import Link from 'next/dist/client/link';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/v1/posts', { 
      cache: 'no-store' 
    });

    if (!res.ok) {
      console.log(`Erro no backend: ${res.status} - ${res.statusText}`);
      const text = await res.text();
      console.log(`❌ Detalhes: ${text}`); 
      throw new Error('Falha ao buscar posts');
    }

    return res.json();
  } catch (error) {
    console.error("Erro de conexão:", error);
    return [];
  }
}

function stripMarkdown(markdown: string): string {
  if (!markdown) return '';
  // Remove negrito, itálico, código e títulos para o resumo
  return markdown
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')   
    .replace(/`([^`]+)`/g, '$1')       
    .replace(/#+\s/g, '')              
    .replace(/\n/g, ' ');              
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen max-w-4xl mx-auto p-6">
      
      <Header />

      {/* Lista de Posts */}
      <section className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
            <p>Nenhum post encontrado.</p>
            <p className="text-sm mt-2">Certifique-se que o backend está rodando!</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block">
              <article 
                className="group p-5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full"
              >
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    {post.author?.name || 'Anônimo'}
                  </span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                
                {/* line-clamp-3 limita o texto a 3 linhas e põe "..." */}
                <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                  {stripMarkdown(post.content)}
                </p>
              </article>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}