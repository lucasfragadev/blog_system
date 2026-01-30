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
    // Primeiro buscar dados do usuário atual, depois carregar árvore
    fetchCurrentUserAndTree();
  }, []);

  const fetchCurrentUserAndTree = async () => {
    try {
      setLoading(true);
      
      // 1. Buscar dados do usuário atual (usando cookies HttpOnly)
      const userRes = await fetch(`${API_URL}/users/me`, {
        credentials: 'include', // Importante: inclui cookies HttpOnly
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (userRes.status === 401) {
        // Não autenticado, redirecionar para login
        router.push('/login');
        return;
      }

      if (!userRes.ok) {
        throw new Error(`Erro ao buscar usuário: ${userRes.status}`);
      }

      const userData = await userRes.json();
      setCurrentUser(userData);

      // 2. Buscar dados da árvore genealógica
      const treeRes = await fetch(`${API_URL}/family/tree`, {
        credentials: 'include', // Importante: inclui cookies HttpOnly
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

      if (treeData.length === 0) {
        setError('Nenhum membro da família encontrado. Adicione membros primeiro.');
        return;
      }

      // 3. Encontrar o membro da família vinculado ao usuário
      const me = treeData.find((m: FamilyMember) => m.user?.id === userData.id);

      if (!me) {
        setError('Seu perfil não foi encontrado na árvore genealógica. Verifique se você está cadastrado como membro da família.');
        return;
      }

      // 4. Construir e renderizar árvore
      const hierarchyData = buildHierarchy(treeData, me);
      renderTree(hierarchyData, me);

    } catch (err) {
      console.error("Erro ao carregar árvore:", err);
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

  const buildHierarchy = (data: FamilyMember[], me: FamilyMember): TreeNodeData => {
    // Criar mapa de membros
    const memberMap = new Map(data.map(m => [m.id, m]));
    
    // Encontrar raiz da árvore (pessoa mais antiga sem pais)
    const roots = data.filter(m => !m.fatherId && !m.motherId);
    let root = roots[0] || me;

    // Se não há raiz clara, usar os pais do usuário como raiz
    if (me.fatherId || me.motherId) {
      const father = me.fatherId ? memberMap.get(me.fatherId) : null;
      const mother = me.motherId ? memberMap.get(me.motherId) : null;
      
      if (father && (!father.fatherId && !father.motherId)) root = father;
      else if (mother && (!mother.fatherId && !mother.motherId)) root = mother;
    }

    // Função recursiva para construir árvore
    const buildNode = (member: FamilyMember): TreeNodeData => {
      const info = getPOVInfo(member, me, data);
      
      // Encontrar filhos
      const children = data.filter(m => m.fatherId === member.id || m.motherId === member.id);
      
      // Adicionar cônjuge como "filho especial" se existir
      const spouse = member.spouseId ? memberMap.get(member.spouseId) : null;
      
      const node: TreeNodeData = {
        id: member.id,
        name: member.name,
        gender: member.gender,
        label: info.label,
        labelColor: info.color,
        isMe: member.id === me.id,
        children: []
      };

      // Adicionar cônjuge primeiro (se existir)
      if (spouse && !children.some(c => c.id === spouse.id)) {
        const spouseInfo = getPOVInfo(spouse, me, data);
        const spouseNode: TreeNodeData = {
          id: spouse.id,
          name: spouse.name,
          gender: spouse.gender,
          label: spouseInfo.label,
          labelColor: spouseInfo.color,
          isMe: spouse.id === me.id,
          children: []
        };
        node.children!.push(spouseNode);
      }

      // Adicionar filhos
      children.forEach(child => {
        if (child.id !== member.spouseId) { // Evitar duplicar cônjuge
          node.children!.push(buildNode(child));
        }
      });

      return node;
    };

    return buildNode(root);
  };

  const renderTree = (data: TreeNodeData, me: FamilyMember) => {
    if (!svgRef.current) return;

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

    root.descendants().forEach((d) => {
      d.x = (d.x ?? 0) + margin.left;
      d.y = (d.y ?? 0) + margin.top;
    });

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

    const nodes = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

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

    nodes.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", "24px")
      .text((d) => d.data.gender === 'MASCULINO' ? '👨' : '👩');

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

    const bounds = g.node()?.getBBox();
    if (bounds && svgRef.current) {
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const centerX = width / 2 - fullWidth / 2 - bounds.x;
      const centerY = height / 2 - fullHeight / 2 - bounds.y;
      
      d3.select(svgRef.current).call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY).scale(0.8));
    }
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