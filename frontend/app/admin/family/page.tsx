'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/app/config/api';
import { Header } from '@/components/Header';

export default function AdminFamilyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    const res = await fetch(`${API_URL}/family/members`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setMembers(await res.json());
    setLoading(false);
  };

  const handleLink = async (memberId: string, type: 'father' | 'mother' | 'spouse') => {
    const label = type === 'father' ? 'Pai' : type === 'mother' ? 'Mãe' : 'Cônjuge';
    const relativeId = prompt(`Digite o ID do(a) ${label}:`);
    if (!relativeId) return;

    await fetch(`${API_URL}/family/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ memberId, relativeId, type })
    });
    fetchMembers();
  };

  if (loading) return <p className="text-center p-10">Carregando membros...</p>;

  return (
    <main className="min-h-screen max-w-6xl mx-auto p-6">
      <Header />
      <h1 className="text-3xl font-bold mb-6">Gestão da Árvore Avelino Fraga</h1>
      <div className="bg-white dark:bg-gray-900 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
            <tr><th className="p-4">Nome / ID</th><th className="p-4">Vínculos</th><th className="p-4 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map(member => (
              <tr key={member.id} className="text-sm">
                <td className="p-4"><div className="font-bold">{member.name}</div><div className="text-[9px] font-mono text-gray-400">{member.id}</div></td>
                <td className="p-4 text-xs">P: {member.familyMember?.father?.name || '---'} | M: {member.familyMember?.mother?.name || '---'}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => handleLink(member.id, 'father')} className="px-2 py-1 bg-blue-50 text-blue-600 rounded">Pai</button>
                  <button onClick={() => handleLink(member.id, 'mother')} className="px-2 py-1 bg-pink-50 text-pink-600 rounded">Mãe</button>
                  <button onClick={() => handleLink(member.id, 'spouse')} className="px-2 py-1 bg-purple-50 text-purple-600 rounded">Cônjuge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}