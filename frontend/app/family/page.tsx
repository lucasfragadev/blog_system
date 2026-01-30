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
          <span className={`absolute -top-2 -right-2 ${data.labelColor} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-sm whitespace-nowrap z-10`}>
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

  const fetchTree = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await fetch(`${API_URL}/family/tree`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      const me = data.find((m: any) => m.user?.id === user.id);

      // --- LÓGICA DE GERAÇÕES E PARENTESCO ---
      const getPOVInfo = (member: any) => {
        if (!me) return { label: "", color: "bg-gray-500", level: 2 };
        if (member.id === me.id) return { label: "Você", color: "bg-blue-500", level: 2 };

        const isMale = member.gender === 'MASCULINO';
        
        // IDs Auxiliares para cálculo
        const myChildrenIds = data.filter((m: any) => m.fatherId === me.id || m.motherId === me.id).map((m: any) => m.id);
        const mySiblings = data.filter((m: any) => m.id !== me.id && ((m.fatherId && m.fatherId === me.fatherId) || (m.motherId && m.motherId === me.motherId)));
        const siblingIds = mySiblings.map((s: any) => s.id);

        // 1. ANCESTRAIS
        if (member.id === me.fatherId) return { label: "Pai", color: "bg-green-600", level: 1 };
        if (member.id === me.motherId) return { label: "Mãe", color: "bg-green-600", level: 1 };

        // 2. MESMA GERAÇÃO
        if (member.id === me.spouseId) return { label: isMale ? "Marido" : "Esposa", color: "bg-pink-500", level: 2 };
        if (siblingIds.includes(member.id)) return { label: isMale ? "Irmão" : "Irmã", color: "bg-purple-600", level: 2 };

        // 3. DESCENDENTES DIRETOS
        if (myChildrenIds.includes(member.id)) return { label: isMale ? "Filho" : "Filha", color: "bg-teal-500", level: 3 };

        // 4. SOBRINHOS
        if (siblingIds.includes(member.fatherId) || siblingIds.includes(member.motherId)) {
          return { label: isMale ? "Sobrinho" : "Sobrinha", color: "bg-indigo-500", level: 3 };
        }

        // 5. NETOS
        const isGrandchild = (member.fatherId && myChildrenIds.includes(member.fatherId)) || (member.motherId && myChildrenIds.includes(member.motherId));
        if (isGrandchild) return { label: isMale ? "Neto" : "Neta", color: "bg-orange-500", level: 4 };

        // 6. AFINIDADE
        if (me.spouseId) {
          const spouse = data.find((m: any) => m.id === me.spouseId);
          if (spouse) {
            if (member.id === spouse.fatherId) return { label: "Sogro", color: "bg-green-700", level: 1 };
            if (member.id === spouse.motherId) return { label: "Sogra", color: "bg-green-700", level: 1 };
            const isSpouseSibling = (member.fatherId && member.fatherId === spouse.fatherId) || (member.motherId && member.motherId === spouse.motherId);
            if (isSpouseSibling) return { label: isMale ? "Cunhado" : "Cunhada", color: "bg-purple-400", level: 2 };
          }
        }

        // 7. NORA/GENRO
        if (member.spouseId) {
          const partnerOfMember = data.find((m: any) => m.id === member.spouseId);
          if (partnerOfMember && myChildrenIds.includes(partnerOfMember.id)) {
            return { label: isMale ? "Genro" : "Nora", color: "bg-pink-400", level: 3 };
          }
        }

        return { label: "", color: "bg-gray-500", level: 2 };
      };

      const newNodes = data.map((member: any, index: number) => {
        const info = getPOVInfo(member);
        return {
          id: member.id,
          type: 'familyNode',
          position: { 
            x: index * 250, 
            y: info.level * 250
          },
          data: { 
            name: member.name, 
            gender: member.gender, 
            label: info.label, 
            labelColor: info.color, 
            isMe: member.user?.id === user.id 
          },
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
    <main className="h-screen w-full flex flex-col p-6 overflow-hidden bg-white dark:bg-black">
      <Header />
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-inner">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
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