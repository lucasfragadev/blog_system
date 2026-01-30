'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { API_URL } from '@/app/config/api';

export default function FamilyTreePage() {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setCurrentUser(JSON.parse(localStorage.getItem('user') || '{}'));
    fetchTree();
  }, []);

  const fetchTree = async () => {
    const res = await fetch(`${API_URL}/family/tree`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setTreeData(await res.json());
  };

  const getPOVLabel = (member: any) => {
    if (!currentUser || !member.user) return "";
    if (member.user.id === currentUser.id) return "Você";
    const me = treeData.find(m => m.user?.id === currentUser.id);
    if (!me) return "";
    if (member.id === me.fatherId) return "Pai";
    if (member.id === me.motherId) return "Mãe";
    if (member.fatherId === me.id || member.motherId === me.id) return "Filho(a)";
    return "";
  };

  return (
    <main className="min-h-screen max-w-6xl mx-auto p-6 text-center">
      <Header />
      <h1 className="text-4xl font-bold text-green-700 mb-8">Família Avelino Fraga</h1>
      <div className="flex flex-wrap justify-center gap-10 py-10">
        {treeData.map((member) => (
          <div key={member.id} className="flex flex-col items-center group">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-green-600 bg-white dark:bg-gray-800 flex items-center justify-center text-3xl shadow-lg">
                {member.gender === 'MASCULINO' ? '👨' : '👩'}
              </div>
              {getPOVLabel(member) && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[9px] px-2 py-1 rounded-full">{getPOVLabel(member)}</span>
              )}
            </div>
            <p className="mt-3 font-bold text-sm">{member.name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}