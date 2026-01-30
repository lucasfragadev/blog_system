'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  NodeProps,
  BackgroundVariant // Importado para resolver o erro de tipo
} from 'reactflow';
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
      <p className="mt-2 font-bold text-xs text-gray-800 dark:text-gray-200 text-center w-40 leading-tight">{data.name}</p>
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
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};

    try {
      const res = await fetch(`${API_URL}/family/tree`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const me = data.find((m: any) => m.user?.id === user.id);

      const getPOVInfo = (member: any) => {
        if (!me) return { label: "", color: "bg-gray-500", level: 3 };
        if (member.id === me.id) return { label: "Você", color: "bg-blue-500", level: 3 };

        const isM = member.gender === 'MASCULINO';
        const myParentsIds = [me.fatherId, me.motherId].filter(Boolean);
        const myChildrenIds = data.filter((m: any) => m.fatherId === me.id || m.motherId === me.id).map((m: any) => m.id);
        const myGrandparentsIds = data.filter((m: any) => myParentsIds.includes(m.id)).flatMap((p: any) => [p.fatherId, p.motherId]).filter(Boolean);
        const siblingIds = data.filter((m: any) => m.id !== me.id && ((m.fatherId && m.fatherId === me.fatherId) || (m.motherId && m.motherId === me.motherId))).map((s: any) => s.id);

        const myGreatGrandparentsIds = data.filter((m: any) => myGrandparentsIds.includes(m.id)).flatMap((g: any) => [g.fatherId, g.motherId]).filter(Boolean);
        if (myGreatGrandparentsIds.includes(member.id)) return { label: isM ? "Bisavô" : "Bisavó", color: "bg-green-900", level: 0 };
        if (myGrandparentsIds.includes(member.id)) return { label: isM ? "Avô" : "Avó", color: "bg-green-800", level: 1 };
        if (myParentsIds.includes(member.id)) return { label: isM ? "Pai" : "Mãe", color: "bg-green-600", level: 2 };

        if (member.id === me.spouseId) return { label: isM ? "Marido" : "Esposa", color: "bg-pink-500", level: 3 };
        if (siblingIds.includes(member.id)) return { label: isM ? "Irmão" : "Irmã", color: "bg-purple-600", level: 3 };

        if (myChildrenIds.includes(member.id)) return { label: isM ? "Filho" : "Filha", color: "bg-teal-500", level: 4 };
        if (siblingIds.includes(member.fatherId) || siblingIds.includes(member.motherId)) return { label: isM ? "Sobrinho" : "Sobrinha", color: "bg-indigo-500", level: 4 };

        const isGrandchild = (member.fatherId && myChildrenIds.includes(member.fatherId)) || (member.motherId && myChildrenIds.includes(member.motherId));
        if (isGrandchild) return { label: isM ? "Neto" : "Neta", color: "bg-orange-500", level: 5 };

        return { label: "", color: "bg-gray-500", level: 3 };
      };

      const newNodes = data.map((member: any, index: number) => {
        const info = getPOVInfo(member);
        return {
          id: member.id,
          type: 'familyNode',
          position: { 
            x: (index * 260) - (data.length * 130),
            y: info.level * 300 
          },
          data: { name: member.name, gender: member.gender, label: info.label, labelColor: info.color, isMe: member.user?.id === user.id },
        };
      });

      const newEdges: Edge[] = [];
      data.forEach((member: any) => {
        const style = { 
          stroke: isDarkMode ? '#4ade80' : '#16a34a', 
          strokeWidth: 3, 
          filter: isDarkMode ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8))' : 'none' 
        };
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
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.1}>
            {/* CORREÇÃO AQUI: Usando o Enum BackgroundVariant para evitar erro de tipo no build */}
            <Background 
              color={isDarkMode ? '#333' : '#ccc'} 
              gap={20} 
              variant={BackgroundVariant.Dots} 
            />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </main>
  );
}