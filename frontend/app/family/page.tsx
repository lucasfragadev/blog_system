'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { Header } from '@/components/Header';
import { API_URL } from '@/app/config/api';

interface FamilyMember {
  id: string;
  name: string;
  gender: 'MASCULINO' | 'FEMININO';
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  user?: { id: string };
}

interface TreeNodeData {
  id: string;
  name: string;
  gender: 'MASCULINO' | 'FEMININO';
  label: string;
  labelColor: string;
  isMe: boolean;
  children?: TreeNodeData[];
}

type TreeNode = d3.HierarchyNode<TreeNodeData>;

export default function FamilyTreeD3Page() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchCurrentUserAndTree();
  }, []);

  const fetchCurrentUserAndTree = async () => {
    try {
      setLoading(true);
      console.log('🔍 Iniciando busca de dados...');
      
      // 1. Buscar dados do usuário atual
      const userRes = await fetch(`${API_URL}/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (userRes.status === 401) {
        console.log('❌ Não autenticado, redirecionando...');
        router.push('/login');
        return;
      }

      if (!userRes.ok) {
        throw new Error(`Erro ao buscar usuário: ${userRes.status}`);
      }

      const userData = await userRes.json();
      console.log('✅ Usuário encontrado:', userData.name);
      setCurrentUser(userData);

      // 2. Buscar dados da árvore genealógica
      const treeRes = await fetch(`${API_URL}/family/tree`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!treeRes.ok) {
        if (treeRes.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Erro ao buscar árvore: ${treeRes.status}`);
      }

      const treeData: FamilyMember[] = await treeRes.json();
      console.log('✅ Dados da árvore:', treeData.length, 'membros');

      if (treeData.length === 0) {
        setError('Nenhum membro da família encontrado. Adicione membros primeiro.');
        return;
      }

      // 3. Encontrar o membro da família vinculado ao usuário
      const me = treeData.find((m: FamilyMember) => m.user?.id === userData.id);
      console.log('✅ Meu perfil na árvore:', me ? me.name : 'Não encontrado');

      if (!me) {
        setError('Seu perfil não foi encontrado na árvore genealógica. Verifique se você está cadastrado como membro da família.');
        return;
      }

      // 4. Construir e renderizar árvore
      console.log('🔍 Construindo hierarquia...');
      const hierarchyData = buildHierarchy(treeData, me);
      console.log('✅ Hierarquia construída:', hierarchyData);
      
      console.log('🔍 Renderizando árvore...');
      renderTree(hierarchyData, me);
      console.log('✅ Árvore renderizada!');

    } catch (err) {
      console.error("❌ Erro ao carregar árvore:", err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao carregar dados: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getPOVInfo = (member: FamilyMember, me: FamilyMember, allData: FamilyMember[]) => {
    if (member.id === me.id) return { label: "Você", color: "#3b82f6", level: 0 };

    const isM = member.gender === 'MASCULINO';
    
    // Mapeamento de IDs para busca rápida
    const parents = [me.fatherId, me.motherId].filter(Boolean) as string[];
    const grandparents = allData.filter((m: FamilyMember) => parents.includes(m.id)).flatMap((p: FamilyMember) => [p.fatherId, p.motherId]).filter(Boolean) as string[];
    const greatGrandparents = allData.filter((m: FamilyMember) => grandparents.includes(m.id)).flatMap((g: FamilyMember) => [g.fatherId, g.motherId]).filter(Boolean) as string[];
    
    const siblings = allData.filter((m: FamilyMember) => 
      m.id !== me.id && 
      ((m.fatherId && m.fatherId === me.fatherId) || (m.motherId && m.motherId === me.motherId))
    );
    const children = allData.filter((m: FamilyMember) => m.fatherId === me.id || m.motherId === me.id);
    const grandchildren = allData.filter((m: FamilyMember) => children.some(c => m.fatherId === c.id || m.motherId === c.id));

    // Níveis Superiores
    if (greatGrandparents.includes(member.id)) return { label: isM ? "Bisavô" : "Bisavó", color: "#059669", level: -3 };
    if (grandparents.includes(member.id)) return { label: isM ? "Avô" : "Avó", color: "#16a34a", level: -2 };
    if (parents.includes(member.id)) return { label: isM ? "Pai" : "Mãe", color: "#22c55e", level: -1 };

    // Mesma Geração (Nível 0)
    if (member.id === me.spouseId) return { label: isM ? "Marido" : "Esposa", color: "#ec4899", level: 0 };
    if (siblings.some(s => s.id === member.id)) return { label: isM ? "Irmão" : "Irmã", color: "#9333ea", level: 0 };

    // Níveis Inferiores
    if (children.some(c => c.id === member.id)) return { label: isM ? "Filho" : "Filha", color: "#0d9488", level: 1 };
    if (grandchildren.some(g => g.id === member.id)) return { label: isM ? "Neto" : "Neta", color: "#f59e0b", level: 2 };

    // --- AFINIDADE ---
    
    // Sogros (pais do cônjuge)
    if (me.spouseId) {
      const spouse = allData.find((m: FamilyMember) => m.id === me.spouseId);
      if (spouse) {
        if (member.id === spouse.fatherId) return { label: "Sogro", color: "#16a34a", level: -1 };
        if (member.id === spouse.motherId) return { label: "Sogra", color: "#16a34a", level: -1 };
      }
    }

    // Noras e Genros (cônjuges dos filhos)
    for (const child of children) {
      if (child.spouseId === member.id) {
        return { label: isM ? "Genro" : "Nora", color: "#0891b2", level: 1 };
      }
    }

    // Cunhados/Cunhadas (cônjuges dos irmãos)
    for (const sibling of siblings) {
      if (sibling.spouseId === member.id) {
        return { label: isM ? "Cunhado" : "Cunhada", color: "#8b5cf6", level: 0 };
      }
    }

    // Concunhados (irmãos do cônjuge)
    if (me.spouseId) {
      const spouse = allData.find((m: FamilyMember) => m.id === me.spouseId);
      if (spouse) {
        const spouseSiblings = allData.filter((m: FamilyMember) => 
          m.id !== spouse.id && 
          ((m.fatherId && m.fatherId === spouse.fatherId) || 
           (m.motherId && m.motherId === spouse.motherId))
        );
        
        if (spouseSiblings.some(s => s.id === member.id)) {
          return { label: isM ? "Cunhado" : "Cunhada", color: "#8b5cf6", level: 0 };
        }
      }
    }

    // Sobrinhos (filhos dos irmãos)
    for (const sibling of siblings) {
      if (member.fatherId === sibling.id || member.motherId === sibling.id) {
        return { label: isM ? "Sobrinho" : "Sobrinha", color: "#6366f1", level: 1 };
      }
    }

    // Tios (irmãos dos pais)
    for (const parentId of parents) {
      const parent = allData.find((m: FamilyMember) => m.id === parentId);
      if (parent) {
        const parentSiblings = allData.filter((m: FamilyMember) => 
          m.id !== parentId && 
          ((m.fatherId && m.fatherId === parent.fatherId) || 
           (m.motherId && m.motherId === parent.motherId))
        );
        
        if (parentSiblings.some(s => s.id === member.id)) {
          return { label: isM ? "Tio" : "Tia", color: "#f59e0b", level: -1 };
        }
      }
    }

    // Primos (filhos dos tios)
    for (const parentId of parents) {
      const parent = allData.find((m: FamilyMember) => m.id === parentId);
      if (parent) {
        const parentSiblings = allData.filter((m: FamilyMember) => 
          m.id !== parentId && 
          ((m.fatherId && m.fatherId === parent.fatherId) || 
           (m.motherId && m.motherId === parent.motherId))
        );
        
        for (const uncle of parentSiblings) {
          if (member.fatherId === uncle.id || member.motherId === uncle.id) {
            return { label: isM ? "Primo" : "Prima", color: "#84cc16", level: 0 };
          }
        }
      }
    }

    return { label: "", color: "#6b7280", level: 0 };
  };

  // ✅ FUNÇÃO CORRIGIDA PARA EVITAR LOOP INFINITO
  const buildHierarchy = (data: FamilyMember[], me: FamilyMember): TreeNodeData => {
    console.log('🔍 Iniciando buildHierarchy para:', me.name);
    
    // Criar mapa de membros para busca rápida
    const memberMap = new Map(data.map(m => [m.id, m]));
    
    // SET para controlar quais membros já foram processados (EVITA LOOP INFINITO)
    const processedMembers = new Set<string>();
    
    // Encontrar raiz da árvore (pessoa mais antiga sem pais)
    const roots = data.filter(m => !m.fatherId && !m.motherId);
    let root = roots[0] || me;
    
    console.log('🔍 Raízes encontradas:', roots.length, 'Raiz escolhida:', root.name);

    // Se não há raiz clara, usar os pais do usuário como raiz
    if (me.fatherId || me.motherId) {
      const father = me.fatherId ? memberMap.get(me.fatherId) : null;
      const mother = me.motherId ? memberMap.get(me.motherId) : null;
      
      if (father && (!father.fatherId && !father.motherId)) {
        root = father;
        console.log('🔍 Usando pai como raiz:', root.name);
      } else if (mother && (!mother.fatherId && !mother.motherId)) {
        root = mother;
        console.log('🔍 Usando mãe como raiz:', root.name);
      }
    }

    // ✅ FUNÇÃO RECURSIVA COM PROTEÇÃO CONTRA LOOP
    const buildNode = (member: FamilyMember, depth: number = 0): TreeNodeData => {
      console.log(`${'  '.repeat(depth)}🔍 Processando: ${member.name} (profundidade: ${depth})`);
      
      // PROTEÇÃO 1: Evitar recursão muito profunda
      if (depth > 8) {
        console.warn(`⚠️ Recursão muito profunda (${depth}) para:`, member.name);
        const info = getPOVInfo(member, me, data);
        return {
          id: member.id,
          name: member.name,
          gender: member.gender,
          label: info.label,
          labelColor: info.color,
          isMe: member.id === me.id,
          children: []
        };
      }

      // PROTEÇÃO 2: Se já processamos este membro, retornar nó simples
      if (processedMembers.has(member.id)) {
        console.log(`${'  '.repeat(depth)}⚠️ Membro já processado:`, member.name);
        const info = getPOVInfo(member, me, data);
        return {
          id: member.id,
          name: member.name,
          gender: member.gender,
          label: info.label,
          labelColor: info.color,
          isMe: member.id === me.id,
          children: []
        };
      }

      // Marcar como processado ANTES de processar filhos
      processedMembers.add(member.id);

      const info = getPOVInfo(member, me, data);
      
      // Encontrar APENAS filhos biológicos (pai OU mãe é este membro)
      const biologicalChildren = data.filter(m => 
        (m.fatherId === member.id || m.motherId === member.id) && 
        !processedMembers.has(m.id) // Não processar se já foi processado
      );
      
      console.log(`${'  '.repeat(depth)}👶 Filhos de ${member.name}:`, biologicalChildren.map(c => c.name));
      
      const node: TreeNodeData = {
        id: member.id,
        name: member.name,
        gender: member.gender,
        label: info.label,
        labelColor: info.color,
        isMe: member.id === me.id,
        children: []
      };

      // Processar filhos recursivamente
      biologicalChildren.forEach(child => {
        if (!processedMembers.has(child.id)) {
          const childNode = buildNode(child, depth + 1);
          node.children!.push(childNode);
        }
      });

      console.log(`${'  '.repeat(depth)}✅ Nó criado para ${member.name} com ${node.children!.length} filhos`);
      return node;
    };

    const result = buildNode(root);
    console.log('✅ Hierarquia final construída:', result);
    return result;
  };

  const renderTree = (data: TreeNodeData, me: FamilyMember) => {
    console.log('🔍 Iniciando renderização da árvore');
    
    if (!svgRef.current) {
      console.error('❌ SVG ref não encontrado');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1200;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g");

    const getNodeFilter = (d: TreeNode): string => {
      if (d.data.isMe) {
        return "drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))";
      }
      if (isDarkMode) {
        return "drop-shadow(0 0 15px rgba(74, 222, 128, 0.4))";
      }
      return "none";
    };

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    if (svgRef.current) {
      d3.select(svgRef.current).call(zoom);
    }

    const treeLayout = d3.tree<TreeNodeData>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .separation((a, b) => {
        if (a.parent === b.parent) return 2;
        return 3;
      });

    const root = d3.hierarchy(data);
    treeLayout(root);

    console.log('🔍 Nós na árvore D3:', root.descendants().length);

    root.descendants().forEach((d) => {
      d.x = (d.x ?? 0) + margin.left;
      d.y = (d.y ?? 0) + margin.top;
    });

    // Criar links (linhas de conexão)
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical<any, TreeNode>()
        .x((d) => d.x ?? 0)
        .y((d) => d.y ?? 0)
      )
      .style("fill", "none")
      .style("stroke", isDarkMode ? "#4ade80" : "#16a34a")
      .style("stroke-width", 2)
      .style("filter", isDarkMode ? "drop-shadow(0 0 6px rgba(74, 222, 128, 0.6))" : "none");

    // Criar nós
    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

    // Círculos dos nós
    nodes.append("circle")
      .attr("r", 30)
      .style("fill", isDarkMode ? "#1f2937" : "#ffffff")
      .style("stroke", (d) => d.data.isMe ? "#3b82f6" : "#16a34a")
      .style("stroke-width", 4)
      .style("filter", getNodeFilter)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", 35);
      })
      .on("mouseout", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", 30);
      });

    // Emojis de gênero
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", "24px")
      .text((d) => d.data.gender === 'MASCULINO' ? '👨' : '👩');

    // Labels de parentesco
    nodes.filter((d) => Boolean(d.data.label))
      .append("rect")
      .attr("x", 20)
      .attr("y", -25)
      .attr("width", (d) => d.data.label.length * 8 + 10)
      .attr("height", 20)
      .attr("rx", 10)
      .style("fill", (d) => d.data.labelColor)
      .style("opacity", 0.9);

    nodes.filter((d) => Boolean(d.data.label))
      .append("text")
      .attr("x", 25)
      .attr("y", -10)
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d) => d.data.label.toUpperCase());

    // Nomes
    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "3.5em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "#e5e7eb" : "#1f2937")
      .each(function(d) {
        const text = d3.select(this);
        const words = d.data.name.split(/\s+/);
        
        if (words.length > 1) {
          text.text(null);
          words.forEach((word, i) => {
            text.append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? 0 : "1.2em")
              .text(word);
          });
        } else {
          text.text(d.data.name);
        }
      });

    // Centralizar árvore
    const bounds = g.node()?.getBBox();
    if (bounds && svgRef.current) {
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const centerX = width / 2 - fullWidth / 2 - bounds.x;
      const centerY = height / 2 - fullHeight / 2 - bounds.y;
      
      d3.select(svgRef.current).call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(0.8));
    }

    console.log('✅ Renderização concluída!');
  };

  const handleZoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.5);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.75);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity.translate(100, 100).scale(0.8));
    }
  };

  // Tela de erro
  if (error) {
    return (
      <main className="h-screen w-full flex flex-col p-6 overflow-hidden bg-white dark:bg-black">
        <Header />
        
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-inner">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Erro na Árvore Genealógica</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Fazer Login
                </button>
                <button 
                  onClick={() => {
                    setError(null);
                    fetchCurrentUserAndTree();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full flex flex-col p-6 overflow-hidden bg-white dark:bg-black">
      <Header />
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-inner">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-white font-medium">Carregando árvore genealógica...</p>
              {currentUser && (
                <p className="text-white text-sm mt-2">Olá, {currentUser.name}!</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg ref={svgRef} className="w-full h-full" />
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={handleZoomIn}
                className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                🔍+
              </button>
              <button 
                onClick={handleZoomOut}
                className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                🔍-
              </button>
              <button 
                onClick={handleResetZoom}
                className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                🎯
              </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>D3.js Tree Layout</strong><br/>
                • Layout automático<br/>
                • Zoom/Pan nativo<br/>
                • Algoritmo hierárquico
                {currentUser && (
                  <>
                    <br/>• Usuário: {currentUser.name}
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}