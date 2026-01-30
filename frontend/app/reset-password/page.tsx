'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_URL } from '@/app/config/api';
// Importação dos ícones para o "olhinho"
import { Eye, EyeOff } from 'lucide-react'; 

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado do "olhinho"
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validação local (Mínimo 6 caracteres e 1 símbolo especial)
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
    if (!passwordRegex.test(password)) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres e um símbolo especial.' });
      return;
    }

    // 2. Validação de confirmação no Frontend
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos confirmPassword para bater com a validação do seu novo Backend
        body: JSON.stringify({ 
          token, 
          newPassword: password, 
          confirmPassword: confirmPassword 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso! Redirecionando...' });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Erro ao redefinir senha.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-6 text-center dark:text-gray-100">
        <h1 className="text-xl font-bold">Token inválido ou ausente. 😕</h1>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">Redefinir Senha</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* CAMPO: NOVA SENHA */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nova Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* CAMPO: CONFIRMAR SENHA */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirmar Nova Senha</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>

        {message.text && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Alterar Senha'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-12 text-gray-100">Carregando formulário...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}