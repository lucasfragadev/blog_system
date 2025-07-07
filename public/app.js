document.addEventListener('DOMContentLoaded', () => {
  // Elementos manipulados
  const postsContainer = document.getElementById('posts-container');
  const loginForm = document.getElementById('login-form');
  const createPostForm = document.getElementById('create-post-form');
  const logoutButton = document.getElementById('logout-button');

  const apiURL = 'http://localhost:3000/api/v1';

  const fetchAndRenderPosts = async () => {
    try {
      const response = await fetch(`${apiURL}/posts`);
      if (!response.ok) {
        throw new Error('Erro de rede.');
      }
      const posts = await response.json();
      postsContainer.innerHTML = '';

      if (posts.length === 0) {
        postsContainer.innerHTML = '<p>Ainda não há posts para exibir.</p>';
        return;
      }

      posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post-item';
        postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p class="post-meta">Por: ${post.author ? post.author.name : 'Autor Desconhecido'}</p>
                    <p>${post.content.substring(0, 200)}...</p>
                `;
        postsContainer.appendChild(postElement);
      });
    } catch (error) {
      console.error('Erro ao buscar os posts:', error);
      postsContainer.innerHTML = '<p style="color: red;">Não foi possível carregar os posts.</p>';
    }
  };

  /**
   * Verifica o estado de autenticação e atualiza a UI para mostrar/esconder os formulários.
   */
  const updateUIBasedOnAuthState = () => {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Se o usuário está LOGADO
      loginForm.style.display = 'none'; // Esconde o formulário de login
      createPostForm.style.display = 'block'; // Mostra o formulário de criar post
      logoutButton.style.display = 'block'; // Mostra o botão de logout
    } else {
      // Se o usuário está DESLOGADO
      loginForm.style.display = 'block'; // Mostra o formulário de login
      createPostForm.style.display = 'none'; // Esconde o formulário de criar post
      logoutButton.style.display = 'none'; // Esconde o botão de logout
    }
  };

  // Listener para o formulário de LOGIN
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${apiURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem('authToken', data.token);
      alert('Login realizado com sucesso!');
      loginForm.reset();
      updateUIBasedOnAuthState(); // Atualiza a UI para o estado "logado"

    } catch (error) {
      console.error('Erro de login:', error);
      alert(error.message);
    }
  });

  // Listener para o formulário de CRIAÇÃO DE POST
  createPostForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;

    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      updateUIBasedOnAuthState();
      return;
    }

    try {
      const response = await fetch(`${apiURL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      alert('Post criado com sucesso!');
      createPostForm.reset();
      fetchAndRenderPosts(); // Atualiza a lista de posts na tela

    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert(error.message);
    }
  });

  // Listener para o botão de LOGOUT
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    alert('Você saiu da sua conta.');
    updateUIBasedOnAuthState(); // Atualiza a UI para o estado "deslogado"
  });

  // Assim que a página carrega, buscamos os posts e ajustamos a UI.
  fetchAndRenderPosts();
  updateUIBasedOnAuthState();
});