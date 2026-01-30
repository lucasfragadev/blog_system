'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  NodeProps,
  BackgroundVariant 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Header } from '@/components/Header';
import { API_URL } from '@/app/config/api';

// Componente de Nó com Efeito Neon e Tooltip de Parentesco
const FamilyNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className={`w-20 h-20 rounded-full border-4 transition-all duration-500
          ${data.isMe ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'border-green-600 dark:border-green-400 dark:shadow-[0_0_15px_rgba(74,222,128,0.4)]'} 
          bg-white dark:bg-gray-900 flex items-center justify-center text-3xl shadow-xl group-hover:scale-110`}>
          {data.gender === 'MASCULINO' ? '👨' : '👩'}
        </div>
        
        {data.label && (
          <span className={`absolute -top-2 -right-2 ${data.labelColor} text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-md whitespace-nowrap z-10`}>
            {data.label}
          </span>
        )}
      </div>
      <p className="mt-2 font-bold text-xs text-gray-800 dark:text-gray-200 text-center w-40 leading-tight">
        {data.name}
      </p>
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const res = await fetch(`${API_URL}/family/tree`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const me = data.find((m: any) => m.user?.id === user.id);

      // --- LÓGICA DE GERAÇÕES (0-7) E RÓTULOS ---
      const getPOVInfo = (member: any) => {
        if (!me) return { label: "", color: "bg-gray-500", level: 4 };
        if (member.id === me.id) return { label: "Você", color: "bg-blue-500", level: 4 };

        const isM = member.gender === 'MASCULINO';
        
        // Mapeamento de IDs para busca rápida
        const parents = [me.fatherId, me.motherId].filter(Boolean);
        const grandparents = data.filter((m: any) => parents.includes(m.id)).flatMap((p: any) => [p.fatherId, p.motherId]).filter(Boolean);
        const greatGrandparents = data.filter((m: any) => grandparents.includes(m.id)).flatMap((g: any) => [g.fatherId, g.motherId]).filter(Boolean);
        const greatGreatGrandparents = data.filter((m: any) => greatGrandparents.includes(m.id)).flatMap((bg: any) => [bg.fatherId, bg.motherId]).filter(Boolean);
        
        const siblings = data.filter((m: any) => m.id !== me.id && ((m.fatherId && m.fatherId === me.fatherId) || (m.motherId && m.motherId === me.motherId))).map((s: any) => s.id);
        const children = data.filter((m: any) => m.fatherId === me.id || m.motherId === me.id).map((c: any) => c.id);
        const grandchildren = data.filter((m: any) => children.includes(m.fatherId) || children.includes(m.motherId)).map((g: any) => g.id);
        const greatGrandchildren = data.filter((m: any) => grandchildren.includes(m.fatherId) || grandchildren.includes(m.motherId)).map((bg: any) => g.id);

        // Níveis Superiores
        if (greatGreatGrandparents.includes(member.id)) return { label: isM ? "Tataravô" : "Tataravó", color: "bg-emerald-600", level: 0 };
        if (greatGrandparents.includes(member.id)) return { label: isM ? "Bisavô" : "Bisavó", color: "bg-green-900", level: 1 };
        if (grandparents.includes(member.id)) return { label: isM ? "Avô" : "Avó", color: "bg-green-800", level: 2 };
        if (parents.includes(member.id)) return { label: isM ? "Pai" : "Mãe", color: "bg-green-600", level: 3 };

        // Mesma Geração (Nível 4)
        if (member.id === me.spouseId) return { label: isM ? "Marido" : "Esposa", color: "bg-pink-500", level: 4 };
        if (siblings.includes(member.id)) return { label: isM ? "Irmão" : "Irmã", color: "bg-purple-600", level: 4 };

        // Níveis Inferiores
        if (children.includes(member.id)) return { label: isM ? "Filho" : "Filha", color: "bg-teal-500", level: 5 };
        if (siblings.includes(member.fatherId) || siblings.includes(member.motherId)) return { label: isM ? "Sobrinho" : "Sobrinha", color: "bg-indigo-500", level: 5 };
        if (grandchildren.includes(member.id)) return { label: isM ? "Neto" : "Neta", color: "bg-orange-500", level: 6 };
        if (greatGrandchildren.includes(member.id)) return { label: isM ? "Bisneto" : "Bisneta", color: "bg-red-500", level: 7 };

        // Afinidade (Sogros e Cunhados para Visão de Cônjuge)
        if (me.spouseId) {
          const spouse = data.find((m: any) => m.id === me.spouseId);
          if (spouse && member.id === spouse.fatherId) return { label: "Sogro", color: "bg-green-700", level: 3 };
          if (spouse && member.id === spouse.motherId) return { label: "Sogra", color: "bg-green-700", level: 3 };
        }

        return { label: "", color: "bg-gray-500", level: 4 };
      };

      // Agrupamento por nível para calcular o X (ajuda a manter a esposa perto)
      const levelCounts: Record<number, number> = {};
      
      const newNodes = data.map((member: any) => {
        const info = getPOVInfo(member);
        const currentCount = levelCounts[info.level] || 0;
        levelCounts[info.level] = currentCount + 1;

        return {
          id: member.id,
          type: 'familyNode',
          position: { 
            x: (currentCount * 280) - 400, // Espaçamento horizontal por nível
            y: info.level * 350           // Espaçamento vertical entre gerações
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

      // --- LINHAS DE CONEXÃO (EDGES) ---
      const newEdges: Edge[] = [];
      data.forEach((member: any) => {
        const lineStyle = { 
          stroke: isDarkMode ? '#4ade80' : '#16a34a', 
          strokeWidth: 3, 
          filter: isDarkMode ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8))' : 'none' 
        };

        if (member.fatherId) {
          newEdges.push({ id: `e-f-${member.id}`, source: member.fatherId, target: member.id, animated: true, style: lineStyle });
        }
        if (member.motherId) {
          newEdges.push({ id: `e-m-${member.id}`, source: member.motherId, target: member.id, animated: true, style: lineStyle });
        }
        // Linha de Cônjuge (opcional, tracejada)
        if (member.spouseId && member.gender === 'MASCULINO') {
          newEdges.push({ 
            id: `e-s-${member.id}`, source: member.id, target: member.spouseId, 
            style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' } 
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) { console.error("Erro na Árvore:", err); } finally { setLoading(false); }
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
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            nodeTypes={nodeTypes} 
            fitView 
            minZoom={0.05}
          >
            <Background 
              color={isDarkMode ? '#333' : '#ccc'} 
              gap={25} 
              variant={BackgroundVariant.Dots} 
            />
            <Controls className="dark:bg-gray-800 dark:border-gray-700 dark:fill-white" />
          </ReactFlow>
        )}
      </div>
    </main>