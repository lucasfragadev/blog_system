'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import { Header } from '@/components/Header';
import { API_URL } from '@/app/config/api';

const FamilyNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`w-20 h-20 rounded-full border-4 transition-all duration-500
          ${data.isMe ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-green-600 dark:border-green-400 dark:shadow-[0_0_15px_rgba(74,222,128,0.5)]'} 
          bg-white dark:bg-gray-900 flex items-center justify-center text-3xl shadow-xl`}>
          {data.gender === 'MASCULINO' ? '👨' : '👩'}
        </div>
        {data.label && (
          <span className={`absolute -top-2 -right-2 ${data.labelColor} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm whitespace-nowrap`}>
            {data.label}
          </span>
        )}
      </div>
      <p className="mt-2 font-bold text-xs text-gray-800 dark:text-gray-200 text-center w-32">{data.name}</p>
    </div>
  );
};

export default function FamilyTreePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const nodeTypes = useMemo(() => ({ familyNode: FamilyNode }), []);

  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => { fetchTree(); }, [isDarkMode]);

  const getPOVLabel = (member: any, me: any, allMembers: any[]) => {
    if (!me || !member) return "";
    if (member.user?.id === me.user?.id) return "Você";

    const isMale = member.gender === 'MASCULINO';

    // 1. Relações Diretas
    if (member.id === me.spouseId) return isMale ? "Marido" : "Esposa";
    if (member.id === me.fatherId) return "Pai";
    if (member.id === me.motherId) return "Mãe";
    if (member.fatherId === me.id || member.motherId === me.id) return isMale ? "Filho" : "Filha";
    
    // 2. Irmãos (Mesmo pai ou mesma mãe)
    const isSibling = (member.fatherId && member.fatherId === me.fatherId) || (member.motherId && member.motherId === me.motherId);
    if (isSibling) return isMale ? "Irmão" : "Irmã";

    // 3. Relações do Cônjuge (Sogros e Cunhados)
    if (me.spouseId) {
      const mySpouse = allMembers.find(m => m.id === me.spouseId);
      if (mySpouse) {
        if (member.id === mySpouse.fatherId) return "Sogro";
        if (member.id === mySpouse.motherId) return "Sogra";
        const isSpouseSibling = (member.fatherId && member.fatherId === mySpouse.fatherId) || (member.motherId && member.motherId === mySpouse.motherId);
        if (isSpouseSibling) return isMale ? "Cunhado" : "Cunhada";
      }
    }

    // 4. Nora e Genro (Para os pais)
    if (member.spouseId) {
      const spouseOfMember = allMembers.find(m => m.id === member.spouseId);
      if (spouseOfMember && (spouseOfMember.fatherId === me.id || spouseOfMember.motherId === me.id)) {
        return isMale ? "Genro" : "Nora";
      }
    }

    // 5. Avós (Pais dos meus pais)
    const myFather = allMembers.find(m => m.id === me.fatherId);
    const myMother = allMembers.find(m => m.id === me.motherId);
    if ((myFather && (member.id === myFather.fatherId || member.id === myFather.motherId)) ||
        (myMother && (member.id === myMother.fatherId || member.id === myMother.motherId))) {
      return isMale ? "Avô" : "Avó";
    }

    return "";
  };

  const fetchTree = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await fetch(`${API_URL}/family/tree`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTreeData(data);
      const me = data.find((m: any) => m.user?.id === user.id);

      const newNodes = data.map((member: any, index: number) => {
        const label = getPOVLabel(member, me, data);
        let labelColor = "bg-gray-500";
        if (label === "Você") labelColor = "bg-blue-500";
        else if (["Pai", "Mãe", "Sogro", "Sogra", "Avô", "Avó"].includes(label)) labelColor = "bg-green-600";
        else if (["Esposa", "Marido", "Nora", "Genro"].includes(label)) labelColor = "bg-pink-500";
        else if (["Irmão", "Irmã", "Cunhado", "Cunhada"].includes(label)) labelColor = "bg-purple-600";
        else if (["Filho", "Filha", "Neto", "Neta"].includes(label)) labelColor = "bg-teal-500";

        return {
          id: member.id,
          type: 'familyNode',
          position: { x: index * 250, y: ["Pai", "Mãe", "Sogro", "Sogra", "Avô", "Avó"].includes(label) ? 0 : 250 },
          data: { name: member.name, gender: member.gender, label, labelColor, isMe: member.user?.id === user.id },
        };
      });

      const newEdges: Edge[] = [];
      data.forEach((member: any) => {
        const style = { stroke: isDarkMode ? '#4ade80' : '#16a34a', strokeWidth: 3, filter: isDarkMode ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8))' : 'none' };
        if (member.fatherId) newEdges.push({ id: `e-f-${member.id}`, source: member.fatherId, target: member.id, animated: true, style });
        if (member.motherId) newEdges.push({ id: `e-m-${member.id}`, source: member.motherId, target: member.id, animated: true, style });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <main className="h-screen w-full flex flex-col p-6 bg-white dark:bg-black">
      <Header />
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>
        ) : (
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
            <Background color={isDarkMode ? '#333' : '#ccc'} gap={20} />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </main>
  );
}