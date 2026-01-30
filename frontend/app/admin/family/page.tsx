'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/app/config/api';

interface Member {
  id: string;
  name: string;
  email: string;
  gender: string;
  familyMember?: {
    father?: { name: string };
    mother?: { name: string };
    spouse?: { name: string };
  };
}

export default function AdminFamilyPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/family/members`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Erro ao carregar membros", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (memberId: string, type: 'father' | 'mother' | 'spouse') => {
    const relativeId = prompt(`Digite o ID do ${type}:`);
    if (!relativeId) return;

    await fetch(`${API_URL}/family/link`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ memberId, relativeId, type })
    });
    
    fetchMembers(); // Atualiza a lista
  };

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestão da Árvore Avelino Fraga</h1>
      
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Vínculos Atuais</th>
              <th className="p-4 text-right">Ações Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map(member => (
              <tr key={member.id} className="text-sm">
                <td className="p-4 font-medium">{member.name}</td>
                <td className="p-4 text-gray-500">
                  P: {member.familyMember?.father?.name || '---'} | 
                  M: {member.familyMember?.mother?.name || '---'}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleLink(member.id, 'father')} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100">Set Pai</button>
                  <button onClick={() => handleLink(member.id, 'mother')} className="px-2 py-1 bg-pink-50 text-pink-600 rounded text-xs hover:bg-pink-100">Set Mãe</button>
                  <button onClick={() => handleLink(member.id, 'spouse')} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs hover:bg-purple-100">Set Cônjuge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}