'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/app/config/api';
import { Header } from '@/components/Header';

export default function AdminFamilyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMembers(); }, []);

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

  // FEAT: Adicionar pessoa que não tem conta (Ex: Avô, Sobrinho)
  const handleAddManual = async () => {
    const name = prompt("Nome completo do familiar:");
    if (!name) return;

    const genderInput = prompt("Gênero (Digite M ou F):")?.toUpperCase();
    if (!genderInput || (genderInput !== 'M' && genderInput !== 'F')) {
      alert("Gênero inválido! Use M ou F.");
      return;
    }

    const gender = genderInput === 'M' ? 'MASCULINO' : 'FEMININO';
    const birthDate = prompt("Data de Nascimento (AAAA-MM-DD) - Opcional:");

    try {
      const res = await fetch(`${API_URL}/family/manual`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, gender, birthDate: birthDate || null })
      });

      if (res.ok) {
        alert("Familiar adicionado com sucesso!");
        fetchMembers();
      }
    } catch (err) {
      alert("Erro ao adicionar familiar.");
    }
  };

  const handleLink = async (memberId: string, type: 'father' | 'mother' | 'spouse') => {
    const label = type === 'father' ? 'Pai' : type === 'mother' ? 'Mãe' : 'Cônjuge';
    const relativeId = prompt(`Digite o ID do(a) ${label}: (Copie da coluna ID abaixo)`);
    
    if (!relativeId) return;

    try {
      const res = await fetch(`${API_URL}/family/link`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ memberId, relativeId, type })
      });

      if (res.ok) fetchMembers();
    } catch (err) {
      console.error("Erro ao vincular", err);
    }
  };

  if (loading) return <p className="text-center p-10">Carregando membros da família...</p>;

  return (
    <main className="min-h-screen max-w-6xl mx-auto p-6">
      <Header />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestão da Árvore Avelino Fraga</h1>
        
        {/* BOTÃO PARA ADICIONAR PESSOAS SEM CONTA */}
        <button 
          onClick={handleAddManual}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-md"
        >
          + Add Familiar s/ Conta
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase font-semibold">
            <tr>
              <th className="p-4">Membro / ID</th>
              <th className="p-4">Vínculos Atuais</th>
              <th className="p-4 text-right">Ações Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map(member => (
              <tr key={member.id} className="text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <td className="p-4">
                  <div className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    {member.name}
                    {!member.user && <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1 rounded">VISUAL</span>}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded inline-block">
                    {member.id}
                  </div>
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">
                  <div className="text-xs"><strong>P:</strong> {member.father?.name || '---'}</div>
                  <div className="text-xs"><strong>M:</strong> {member.mother?.name || '---'}</div>
                  <div className="text-xs"><strong>C:</strong> {member.spouse?.name || '---'}</div>
                </td>
                <td className="p-4 text-right space-x-1 whitespace-nowrap">
                  <button onClick={() => handleLink(member.id, 'father')} className="px-2 py-1.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold hover:bg-blue-100">Set Pai</button>
                  <button onClick={() => handleLink(member.id, 'mother')} className="px-2 py-1.5 bg-pink-50 text-pink-600 rounded-md text-[10px] font-bold hover:bg-pink-100">Set Mãe</button>
                  <button onClick={() => handleLink(member.id, 'spouse')} className="px-2 py-1.5 bg-purple-50 text-purple-600 rounded-md text-[10px] font-bold hover:bg-purple-100">Set Cônjuge</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}