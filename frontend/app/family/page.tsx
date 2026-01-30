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

  useEffect(() => { 
    fetchTree(); 
  }, []);

  const fetchTree = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const res = await fetch(`${API_URL}/family/tree`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const me = data.find((m: any) => m.user?.id === user.id);

      if (!me) {
        setLoading(false);
        return;
      }

      // --- LÓGICA DE GERAÇÕES E RÓTULOS CORRIGIDA ---
      const getPOVInfo = (member: any) => {
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
        const greatGrandchildren = data.filter((m: any) => grandchildren.includes(m.fatherId) || grandchildren.includes(m.motherId)).map((bg: any) => bg.id);

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
        if (grandchildren.includes(member.id)) return { label: isM ? "Neto" : "Neta", color: "bg-orange-500", level: 6 };
        if (greatGrandchildren.includes(member.id)) return { label: isM ? "Bisneto" : "Bisneta", color: "bg-red-500", level: 7 };

        // --- AFINIDADE CORRIGIDA ---
        
        // Sogros (pais do cônjuge)
        if (me.spouseId) {
          const spouse = data.find((m: any) => m.id === me.spouseId);
          if (spouse) {
            if (member.id === spouse.fatherId) return { label: "Sogro", color: "bg-green-700", level: 3 };
            if (member.id === spouse.motherId) return { label: "Sogra", color: "bg-green-700", level: 3 };
          }
        }

        // Noras e Genros (cônjuges dos filhos)
        for (const childId of children) {
          const child = data.find((m: any) => m.id === childId);
          if (child && child.spouseId === member.id) {
            return { label: isM ? "Genro" : "Nora", color: "bg-cyan-600", level: 5 };
          }
        }

        // Cunhados/Cunhadas (cônjuges dos irmãos)
        for (const siblingId of siblings) {
          const sibling = data.find((m: any) => m.id === siblingId);
          if (sibling && sibling.spouseId === member.id) {
            return { label: isM ? "Cunhado" : "Cunhada", color: "bg-violet-600", level: 4 };
          }
        }

        // Concunhados (irmãos do cônjuge)
        if (me.spouseId) {
          const spouse = data.find((m: any) => m.id === me.spouseId);
          if (spouse) {
            const spouseSiblings = data.filter((m: any) => 
              m.id !== spouse.id && 
              ((m.fatherId && m.fatherId === spouse.fatherId) || 
               (m.motherId && m.motherId === spouse.motherId))
            ).map((s: any) => s.id);
            
            if (spouseSiblings.includes(member.id)) {
              return { label: isM ? "Cunhado" : "Cunhada", color: "bg-violet-600", level: 4 };
            }
          }
        }

        // Sobrinhos (filhos dos irmãos)
        for (const siblingId of siblings) {
          const sibling = data.find((m: any) => m.id === siblingId);
          if (sibling && (member.fatherId === siblingId || member.motherId === siblingId)) {
            return { label: isM ? "Sobrinho" : "Sobrinha", color: "bg-indigo-500", level: 5 };
          }
        }

        // Tios (irmãos dos pais)
        for (const parentId of parents) {
          const parent = data.find((m: any) => m.id === parentId);
          if (parent) {
            const parentSiblings = data.filter((m: any) => 
              m.id !== parentId && 
              ((m.fatherId && m.fatherId === parent.fatherId) || 
               (m.motherId && m.motherId === parent.motherId))
            ).map((s: any) => s.id);
            
            if (parentSiblings.includes(member.id)) {
              return { label: isM ? "Tio" : "Tia", color: "bg-amber-600", level: 3 };
            }
          }
        }

        // Primos (filhos dos tios)
        for (const parentId of parents) {
          const parent = data.find((m: any) => m.id === parentId);
          if (parent) {
            const parentSiblings = data.filter((m: any) => 
              m.id !== parentId && 
              ((m.fatherId && m.fatherId === parent.fatherId) || 
               (m.motherId && m.motherId === parent.motherId))
            );
            
            for (const uncle of parentSiblings) {
              if (member.fatherId === uncle.id || member.motherId === uncle.id) {
                return { label: isM ? "Primo" : "Prima", color: "bg-lime-600", level: 4 };
              }
            }
          }
        }

        return { label: "", color: "bg-gray-500", level: 4 };
      };

      // --- ALGORITMO DE POSICIONAMENTO INTELIGENTE ---
      const calculatePositions = () => {
        const membersByLevel: Record<number, any[]> = {};
        const positions = new Map();
        const NODE_WIDTH = 200; // Largura entre nós
        const LEVEL_HEIGHT = 250; // Altura entre níveis
        const COUPLE_SPACING = 120; // Espaçamento entre cônjuges

        // Agrupar membros por nível
        data.forEach((member: any) => {
          const info = getPOVInfo(member);
          member.info = info;
          
          if (!membersByLevel[info.level]) {
            membersByLevel[info.level] = [];
          }
          membersByLevel[info.level].push(member);
        });

        // Função para encontrar casais
        const findCouples = (levelMembers: any[]) => {
          const couples: any[][] = [];
          const singles: any[] = [];
          const processed = new Set();

          levelMembers.forEach(member => {
            if (processed.has(member.id)) return;

            if (member.spouseId) {
              const spouse = levelMembers.find(m => m.id === member.spouseId);
              if (spouse && !processed.has(spouse.id)) {
                // Esposa sempre à esquerda, marido à direita
                if (member.gender === 'FEMININO') {
                  couples.push([member, spouse]);
                } else {
                  couples.push([spouse, member]);
                }
                processed.add(member.id);
                processed.add(spouse.id);
              } else {
                singles.push(member);
                processed.add(member.id);
              }
            } else {
              singles.push(member);
              processed.add(member.id);
            }
          });

          return { couples, singles };
        };

        // Função para calcular centro dos pais
        const getParentsCenter = (member: any) => {
          if (!member.fatherId && !member.motherId) return null;

          const father = member.fatherId ? positions.get(member.fatherId) : null;
          const mother = member.motherId ? positions.get(member.motherId) : null;

          if (father && mother) {
            return (father.x + mother.x) / 2;
          } else if (father) {
            return father.x;
          } else if (mother) {
            return mother.x;
          }
          return null;
        };

        // Processar cada nível
        for (let level = 0; level <= 7; level++) {
          const levelMembers = membersByLevel[level] || [];
          if (levelMembers.length === 0) continue;

          const { couples, singles } = findCouples(levelMembers);
          
          // Agrupar por família (mesmos pais)
          const familyGroups: Record<string, any[]> = {};
          
          [...couples.flat(), ...singles].forEach(member => {
            const familyKey = `${member.fatherId || 'none'}-${member.motherId || 'none'}`;
            if (!familyGroups[familyKey]) {
              familyGroups[familyKey] = [];
            }
            familyGroups[familyKey].push(member);
          });

          // Ordenar grupos de família
          const sortedFamilyGroups = Object.values(familyGroups).sort((a, b) => {
            // Priorizar grupo que contém o usuário principal
            const aHasMe = a.some(m => m.id === me.id);
            const bHasMe = b.some(m => m.id === me.id);
            if (aHasMe && !bHasMe) return -1;
            if (!aHasMe && bHasMe) return 1;

            // Ordenar por centro dos pais se disponível
            const aParentsCenter = getParentsCenter(a[0]);
            const bParentsCenter = getParentsCenter(b[0]);
            if (aParentsCenter !== null && bParentsCenter !== null) {
              return aParentsCenter - bParentsCenter;
            }

            return a[0].name.localeCompare(b[0].name);
          });

          // Calcular posições
          let currentX = 0;
          const totalWidth = sortedFamilyGroups.reduce((sum, group) => {
            const groupCouples = couples.filter(couple => 
              group.includes(couple[0]) || group.includes(couple[1])
            );
            const groupSingles = singles.filter(single => group.includes(single));
            return sum + (groupCouples.length * (NODE_WIDTH + COUPLE_SPACING)) + (groupSingles.length * NODE_WIDTH);
          }, 0);

          currentX = -totalWidth / 2;

          sortedFamilyGroups.forEach(familyGroup => {
            // Processar casais da família
            const familyCouples = couples.filter(couple => 
              familyGroup.includes(couple[0]) || familyGroup.includes(couple[1])
            );
            
            // Processar solteiros da família
            const familySingles = singles.filter(single => familyGroup.includes(single));

            // Posicionar casais
            familyCouples.forEach(couple => {
              const [wife, husband] = couple;
              
              // Esposa à esquerda
              positions.set(wife.id, {
                x: currentX,
                y: level * LEVEL_HEIGHT
              });

              // Marido à direita
              positions.set(husband.id, {
                x: currentX + COUPLE_SPACING,
                y: level * LEVEL_HEIGHT
              });

              currentX += NODE_WIDTH + COUPLE_SPACING;
            });

            // Posicionar solteiros
            familySingles.forEach(single => {
              // Tentar centralizar com base nos pais
              const parentsCenter = getParentsCenter(single);
              let x = currentX;

              if (parentsCenter !== null && familySingles.length === 1) {
                x = parentsCenter;
              }

              positions.set(single.id, {
                x,
                y: level * LEVEL_HEIGHT
              });

              currentX += NODE_WIDTH;
            });

            currentX += NODE_WIDTH * 0.5; // Espaço entre famílias
          });
        }

        return positions;
      };

      const positions = calculatePositions();

      // Criar nós com posições calculadas
      const newNodes = data.map((member: any) => {
        const info = getPOVInfo(member);
        const position = positions.get(member.id) || { x: 0, y: info.level * 250 };

        return {
          id: member.id,
          type: 'familyNode',
          position,
          data: { 
            name: member.name, 
            gender: member.gender, 
            label: info.label, 
            labelColor: info.color, 
            isMe: member.user?.id === user.id 
          },
        };
      });

      // --- LINHAS DE CONEXÃO MELHORADAS ---
      const newEdges: Edge[] = [];
      
      data.forEach((member: any) => {
        const parentLineStyle = { 
          stroke: isDarkMode ? '#4ade80' : '#16a34a', 
          strokeWidth: 2, 
          filter: isDarkMode ? 'drop-shadow(0 0 6px rgba(74, 222, 128, 0.6))' : 'none' 
        };

        const spouseLineStyle = {
          stroke: '#ec4899',
          strokeWidth: 3,
          strokeDasharray: '8,4',
          filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.4))'
        };

        // Conexões pai-filho
        if (member.fatherId) {
          newEdges.push({ 
            id: `e-f-${member.id}`, 
            source: member.fatherId, 
            target: member.id, 
            animated: true, 
            style: parentLineStyle,
            type: 'smoothstep'
          });
        }
        
        if (member.motherId) {
          newEdges.push({ 
            id: `e-m-${member.id}`, 
            source: member.motherId, 
            target: member.id, 
            animated: true, 
            style: parentLineStyle,
            type: 'smoothstep'
          });
        }
        
        // Linha de Cônjuge
        if (member.spouseId && member.gender === 'MASCULINO') {
          // Só criar uma linha por casal (do marido para esposa)
          newEdges.push({ 
            id: `e-s-${member.id}`, 
            source: member.spouseId, // Da esposa (esquerda)
            target: member.id,       // Para o marido (direita)
            style: spouseLineStyle,
            type: 'straight',
            label: '💕',
            labelStyle: { fontSize: '14px' },
            labelBgStyle: { fill: 'transparent' }
          });
        }
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) { 
      console.error("Erro na Árvore:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // Função para atualizar estilos das edges quando o tema muda
  useEffect(() => {
    if (nodes.length > 0) {
      setEdges(prevEdges => 
        prevEdges.map(edge => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: edge.style?.strokeDasharray ? '#ec4899' : (isDarkMode ? '#4ade80' : '#16a34a'),
            filter: edge.style?.strokeDasharray 
              ? 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.4))'
              : (isDarkMode ? 'drop-shadow(0 0 6px rgba(74, 222, 128, 0.6))' : 'none')
          }
        }))
      );
    }
  }, [isDarkMode, nodes.length]);

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
            minZoom={0.1}
            maxZoom={1.2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
            fitViewOptions={{
              padding: 0.3,
              includeHiddenNodes: false,
              minZoom: 0.1,
              maxZoom: 1.2
            }}
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
  );
}