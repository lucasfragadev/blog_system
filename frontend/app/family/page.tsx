'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  NodeProps 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Header } from '@/components/Header';
import { API_URL } from '@/app/config/api';

const FamilyNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Círculo com borda que brilha no dark mode */}
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
  const [isDarkMode, setIsDarkMode] = useState(false); // Estado para o tema

  const nodeTypes = useMemo(() => ({ familyNode: FamilyNode }), []);

  // Monitora se o usuário trocou o tema do site
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    // Observador para mudanças na classe 'dark' do <html>
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchTree();
  }, [isDarkMode]); // Recalcula as cores quando o tema muda

  const fetchTree = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const res = await fetch(`${API_URL}/family/tree`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const treeData = await res.json();
      const me = treeData.find((m: any) => m.user?.id === user.id);

      const newNodes: Node[] = treeData.map((member: any, index: number) => {
        let label = "";
        let labelColor = "bg-gray-500";

        if (member.user?.id === user.id) {
          label = "Você";
          labelColor = "bg-blue-500";
        } else if (me) {
          if (member.id === me.spouseId) { 
            label = member.gender === 'FEMININO' ? "Esposa" : "Marido"; 
            labelColor = "bg-pink-500"; 
          } 
          else if (member.id === me.fatherId) { label = "Pai"; labelColor = "bg-green-600"; }
          else if (member.id === me.motherId) { label = "Mãe"; labelColor = "bg-green-600"; }
          else if (
            (member.fatherId && member.fatherId === me.fatherId) || 
            (member.motherId && member.motherId === me.motherId)
          ) {
            label = member.gender === 'MASCULINO' ? "Irmão" : "Irmã";
            labelColor = "bg-purple-600";
          }
          else if (member.fatherId === me.id || member.motherId === me.id) {
            label = member.gender === 'MASCULINO' ? "Filho" : "Filha";
            labelColor = "bg-teal-500";
          }
        }

        return {
          id: member.id,
          type: 'familyNode',
          position: { 
            x: index * 250, 
            y: label === "Pai" || label === "Mãe" ? 0 : 
               label === "Irmão" || label === "Irmã" || label === "Você" || label === "Esposa" || label === "Marido" ? 250 : 500 
          },
          data: { 
            name: member.name, 
            gender: member.gender, 
            label, 
            labelColor,
            isMe: member.user?.id === user.id 
          },
        };
      });

      // 4. Configuração das Linhas NEON
      const newEdges: Edge[] = [];
      treeData.forEach((member: any) => {
        const edgeStyle = {
          // No dark mode usamos Verde Neon, no light usamos Verde Escuro
          stroke: isDarkMode ? '#4ade80' : '#16a34a', 
          strokeWidth: 3,
          // Efeito de brilho apenas no Dark Mode
          filter: isDarkMode ? 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8))' : 'none'
        };

        if (member.fatherId) {
          newEdges.push({ id: `e-${member.fatherId}-${member.id}`, source: member.fatherId, target: member.id, animated: true, style: edgeStyle });
        }
        if (member.motherId) {
          newEdges.push({ id: `e-${member.motherId}-${member.id}`, source: member.motherId, target: member.id, animated: true, style: edgeStyle });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error("Erro ao carregar árvore:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full flex flex-col p-6 overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      <Header />
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-inner relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <h1 className="text-2xl font-black text-green-800 dark:text-green-400 uppercase tracking-tighter drop-shadow-sm">
                Família Avelino Fraga
              </h1>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={1.5}
            >
              {/* Ajusta a cor da grade de fundo conforme o tema */}
              <Background color={isDarkMode ? '#333' : '#ccc'} gap={20} />
              <Controls className="dark:bg-gray-800 dark:border-gray-700 dark:fill-white" />
            </ReactFlow>
          </>
        )}
      </div>
    </main>
  );
}