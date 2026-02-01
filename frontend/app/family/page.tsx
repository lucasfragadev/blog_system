'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { Header } from '@/components/Header';
import { API_URL } from '@/app/config/api';

const DEBUG_MODE = false;

const log = (...args: any[]) => {
  if (DEBUG_MODE) console.log(...args);
};

const warn = (...args: any[]) => {
  if (DEBUG_MODE) console.warn(...args);
};

const logError = (...args: any[]) => {
  console.error(...args); 
};

interface FamilyMember {
  id: string;
  name: string;
  gender: 'MASCULINO' | 'FEMININO';
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  user?: { id: string };
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  gender: 'MASCULINO' | 'FEMININO';
  label: string;
  labelColor: string;
  isMe: boolean;
  generation: number;
  isFixed?: boolean; // Nova propriedade para controlar se o nó está fixo
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: 'parent' | 'spouse' | 'child' | 'sibling';
}

export default function FamilyTreeD3Page() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [networkData, setNetworkData] = useState<{ nodes: NetworkNode[], links: NetworkLink[] } | null>(null);
  const [meData, setMeData] = useState<FamilyMember | null>(null);
  const [isLayoutMode, setIsLayoutMode] = useState(false); // Modo de organização

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
      log('🔍 Iniciando busca de dados...');
      
      const userRes = await fetch(`${API_URL}/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (userRes.status === 401) {
        log('❌ Não autenticado, redirecionando...');
        router.push('/login');
        return;
      }

      if (!userRes.ok) {
        throw new Error(`Erro ao buscar usuário: ${userRes.status}`);
      }

      const userData = await userRes.json();
      log('✅ Usuário encontrado:', userData.name);
      setCurrentUser(userData);

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

      const familyData: FamilyMember[] = await treeRes.json();
      log('✅ Dados da árvore:', familyData.length, 'membros');

      if (familyData.length === 0) {
        setError('Nenhum membro da família encontrado. Adicione membros primeiro.');
        return;
      }

      const me = familyData.find((m: FamilyMember) => m.user?.id === userData.id);
      log('✅ Meu perfil na árvore:', me ? me.name : 'Não encontrado');

      if (!me) {
        setError('Seu perfil não foi encontrado na árvore genealógica. Verifique se você está cadastrado como membro da família.');
        return;
      }

      log('🔍 Construindo rede familiar completa...');
      const network = buildFamilyNetwork(familyData, me);
      log('✅ Rede familiar construída:', network);
      
      setNetworkData(network);
      setMeData(me);

    } catch (err) {
      logError("❌ Erro ao carregar árvore:", err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao carregar dados: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getPOVInfo = (member: FamilyMember, me: FamilyMember, allData: FamilyMember[]) => {
    if (member.id === me.id) return { label: "Você", color: "#3b82f6", level: 0 };

    const isM = member.gender === 'MASCULINO';
    
    const parents = [me.fatherId, me.motherId].filter(Boolean) as string[];
    const grandparents = allData.filter((m: FamilyMember) => parents.includes(m.id)).flatMap((p: FamilyMember) => [p.fatherId, p.motherId]).filter(Boolean) as string[];
    const greatGrandparents = allData.filter((m: FamilyMember) => grandparents.includes(m.id)).flatMap((g: FamilyMember) => [g.fatherId, g.motherId]).filter(Boolean) as string[];
    
    const siblings = allData.filter((m: FamilyMember) => 
      m.id !== me.id && 
      ((m.fatherId && m.fatherId === me.fatherId) || (m.motherId && m.motherId === me.motherId))
    );
    const children = allData.filter((m: FamilyMember) => m.fatherId === me.id || m.motherId === me.id);
    const grandchildren = allData.filter((m: FamilyMember) => children.some(c => m.fatherId === c.id || m.motherId === c.id));

    if (greatGrandparents.includes(member.id)) return { label: isM ? "Bisavô" : "Bisavó", color: "#059669", level: -3 };
    if (grandparents.includes(member.id)) return { label: isM ? "Avô" : "Avó", color: "#16a34a", level: -2 };
    if (parents.includes(member.id)) return { label: isM ? "Pai" : "Mãe", color: "#22c55e", level: -1 };

    if (member.id === me.spouseId) return { label: isM ? "Marido" : "Esposa", color: "#ec4899", level: 0 };
    if (siblings.some(s => s.id === member.id)) return { label: isM ? "Irmão" : "Irmã", color: "#9333ea", level: 0 };

    if (children.some(c => c.id === member.id)) return { label: isM ? "Filho" : "Filha", color: "#0d9488", level: 1 };
    if (grandchildren.some(g => g.id === member.id)) return { label: isM ? "Neto" : "Neta", color: "#f59e0b", level: 2 };

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

    // Cunhados (irmãos do cônjuge)
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

  const buildFamilyNetwork = (data: FamilyMember[], me: FamilyMember): { nodes: NetworkNode[], links: NetworkLink[] } => {
    log('🔍 Iniciando buildFamilyNetwork para:', me.name);
    
    const memberMap = new Map(data.map(m => [m.id, m]));
    const familyNetwork = new Set<string>();
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // Mapear toda a rede familiar conectada ao usuário
    const mapFamilyNetwork = (startMember: FamilyMember, visited = new Set<string>()) => {
      if (visited.has(startMember.id)) return;
      visited.add(startMember.id);
      familyNetwork.add(startMember.id);
      
      log(`🔗 Mapeando rede de: ${startMember.name}`);

      // Adicionar pais
      if (startMember.fatherId) {
        const father = memberMap.get(startMember.fatherId);
        if (father) mapFamilyNetwork(father, visited);
      }
      if (startMember.motherId) {
        const mother = memberMap.get(startMember.motherId);
        if (mother) mapFamilyNetwork(mother, visited);
      }

      // Adicionar cônjuge
      if (startMember.spouseId) {
        const spouse = memberMap.get(startMember.spouseId);
        if (spouse) mapFamilyNetwork(spouse, visited);
      }

      // Adicionar filhos
      const children = data.filter(m => m.fatherId === startMember.id || m.motherId === startMember.id);
      children.forEach(child => mapFamilyNetwork(child, visited));

      // Adicionar irmãos
      const siblings = data.filter(m => 
        m.id !== startMember.id && 
        ((m.fatherId && m.fatherId === startMember.fatherId) || 
         (m.motherId && m.motherId === startMember.motherId))
      );
      siblings.forEach(sibling => mapFamilyNetwork(sibling, visited));
    };

    mapFamilyNetwork(me);
    log('✅ Rede familiar mapeada:', familyNetwork.size, 'membros');

    // Criar nós para todos os membros da rede familiar
    Array.from(familyNetwork).forEach(memberId => {
      const member = memberMap.get(memberId)!;
      const info = getPOVInfo(member, me, data);
      
      const node: NetworkNode = {
        id: member.id,
        name: member.name,
        gender: member.gender,
        label: info.label,
        labelColor: info.color,
        isMe: member.id === me.id,
        generation: info.level,
        isFixed: false
      };
      
      nodes.push(node);
    });

    // Criar links entre os membros
    Array.from(familyNetwork).forEach(memberId => {
      const member = memberMap.get(memberId)!;
      
      // Links para pais
      if (member.fatherId && familyNetwork.has(member.fatherId)) {
        links.push({
          source: member.fatherId,
          target: member.id,
          type: 'parent'
        });
      }
      
      if (member.motherId && familyNetwork.has(member.motherId)) {
        links.push({
          source: member.motherId,
          target: member.id,
          type: 'parent'
        });
      }
      
      // Links para cônjuge (apenas uma direção para evitar duplicatas)
      if (member.spouseId && familyNetwork.has(member.spouseId) && member.id < member.spouseId) {
        links.push({
          source: member.id,
          target: member.spouseId,
          type: 'spouse'
        });
      }

      const siblings = data.filter(m =>
        m.id !== member.id &&
        familyNetwork.has(m.id) &&
        ((m.fatherId && m.motherId === member.fatherId) ||
      (m.motherId && m.motherId === member.motherId))
      );

      siblings.forEach(sibling => {
        if (member.id < sibling.id) {
          links.push({
            source: member.id,
            target: sibling.id,
            type: 'sibling'
          });
        }
      });
    });

    log('✅ Rede construída:', nodes.length, 'nós e', links.length, 'links');
    return { nodes, links };
  };

  const renderNetwork = useCallback((data: { nodes: NetworkNode[], links: NetworkLink[] }, me: FamilyMember) => {
    log('🔍 Iniciando renderização da rede familiar');
    
    if (!svgRef.current) {
      console.error('❌ SVG ref ainda não está disponível');
      return;
    }

    log('✅ SVG ref encontrado, continuando renderização...');

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1600;
    const height = 1000;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    svg.attr("width", width).attr("height", height);

    const container = svg.append("g");

    // Configurar zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Clonar dados para evitar mutação
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Configurar simulação de força
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60))
      .force("y", d3.forceY().y((d: any) => {
        // Posicionar por geração
        const baseY = height / 2;
        const generationSpacing = 120;
        return baseY + (d.generation * generationSpacing);
      }).strength(0.8));

    // Salvar referência da simulação
    simulationRef.current = simulation;

    // Criar links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 3)
      .attr("stroke", (d) => {
        switch (d.type) {
          case 'parent': return isDarkMode ? "#4ad9de" : "#16a34a";
          case 'spouse': return isDarkMode ? "#f472b6" : "#ec4848";
          case 'sibling': return isDarkMode ? "#fbbf24" : "#f59e0b";
          default: return isDarkMode ? "#6b7280" : "#9ca3af";
        }
      })
      .attr("stroke-dasharray", (d) => {
        if (d.type === 'spouse') return "5,5";
        if (d.type === 'sibling') return "3,3";
        return "none";
      }
    );

    // Criar nós
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          
          // Se estiver no modo de layout, manter o nó fixo
          if (isLayoutMode) {
            d.isFixed = true;
            // Manter as coordenadas fixas
            d.fx = event.x;
            d.fy = event.y;
            log(`📌 Nó ${d.name} fixado em (${event.x}, ${event.y})`);
          } else {
            // Liberar o nó para se mover livremente
            d.fx = null;
            d.fy = null;
            d.isFixed = false;
          }
        }));

    // Círculos dos nós
    node.append("circle")
      .attr("r", 40)
      .attr("fill", (d) => {
        if (d.isFixed && isLayoutMode) {
          return isDarkMode ? "#374151" : "#f3f4f6";
        }
        return isDarkMode ? "#1f2937" : "#ffffff";
      })
      .attr("stroke", (d) => {
        if (d.isFixed && isLayoutMode) {
          return "#f59e0b";
        }
        return d.isMe ? "#3b82f6" : "#16a34a";
      })
      .attr("stroke-width", (d) => {
        if (d.isFixed && isLayoutMode) return 4;
        return d.isMe ? 6 : 4;
      })
      .style("filter", (d) => {
        if (d.isMe) {
          return "drop-shadow(0 0 25px rgba(59, 130, 246, 0.8))";
        }
        if (d.isFixed && isLayoutMode) {
          return "drop-shadow(0 0 15px rgba(245, 158, 11, 0.6))";
        }
        if (isDarkMode) {
          return "drop-shadow(0 0 15px rgba(74, 222, 128, 0.4))";
        }
        return "none";
      })
      .style("cursor", "pointer");

    // Emojis de gênero
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", "32px")
      .style("pointer-events", "none")
      .text((d) => d.gender === 'MASCULINO' ? '👨' : '👩');

    // Labels de parentesco
    node.filter((d) => Boolean(d.label))
      .append("rect")
      .attr("x", 30)
      .attr("y", -35)
      .attr("width", (d) => d.label.length * 9 + 12)
      .attr("height", 22)
      .attr("rx", 11)
      .attr("fill", (d) => d.labelColor)
      .style("opacity", 0.95);

    node.filter((d) => Boolean(d.label))
      .append("text")
      .attr("x", 40)
      .attr("y", -20)
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text((d) => d.label.toUpperCase());

    // Nomes
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "4.5em")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", isDarkMode ? "#e5e7eb" : "#1f2937")
      .style("pointer-events", "none")
      .each(function(d) {
        const text = d3.select(this);
        const words = d.name.split(/\s+/);
        
        if (words.length > 2) {
          text.text(null);
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", 65)
            .text(words[0]);
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text(words[words.length - 1]);
        } else if (words.length > 1) {
          text.text(null);
          words.forEach((word, i) => {
            text.append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? 0 : "1.2em")
              .text(word);
          });
        } else {
          text.text(d.name);
        }
      });

    // Atualizar posições na simulação
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Centralizar na pessoa principal após estabilizar
    setTimeout(() => {
      const meNode = nodes.find(n => n.isMe);
      if (meNode && meNode.x && meNode.y) {
        const scale = 0.8;
        const translateX = width / 2 - meNode.x * scale;
        const translateY = height / 2 - meNode.y * scale;
        
        svg.transition()
          .duration(1000)
          .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
      }
    }, 3000);

    log('✅ Renderização da rede concluída com sucesso!');
  }, [isDarkMode, isLayoutMode]);

  // useEffect para renderizar quando os dados estiverem prontos
  useEffect(() => {
    if (networkData && meData && svgRef.current && !loading) {
      log('🔍 SVG disponível, renderizando rede...');
      renderNetwork(networkData, meData);
    }
  }, [networkData, meData, loading, isDarkMode, renderNetwork]);

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
        .duration(50)
        .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity.translate(100, 100).scale(0.8));
    }
  };

  const toggleLayoutMode = () => {
    setIsLayoutMode(!isLayoutMode);
    log(`🔧 Modo de layout ${!isLayoutMode ? 'ativado' : 'desativado'}`);
  };

  const unfixAllNodes = () => {
    if (simulationRef.current && networkData) {
      // Liberar todos os nós
      networkData.nodes.forEach(node => {
        node.isFixed = false;
        node.fx = null;
        node.fy = null;
      });
      
      // Reiniciar a simulação
      simulationRef.current.alpha(0.3).restart();
      
      // Re-renderizar para atualizar as cores
      if (meData) {
        renderNetwork(networkData, meData);
      }
      
      log('🔓 Todos os nós foram liberados');
    }
  };

  const pauseSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.stop();
      log('⏸️ Simulação pausada');
    }
  };

  const resumeSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
      log('▶️ Simulação retomada');
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
              <p className="text-white font-medium">Carregando rede familiar...</p>
              {currentUser && (
                <p className="text-white text-sm mt-2">Olá, {currentUser.name}!</p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg ref={svgRef} className="w-full h-full" />
            
            {/* Controles de Zoom */}
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

            {/* Controles de Layout */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <button 
                onClick={toggleLayoutMode}
                className={`p-2 rounded-lg shadow-lg border transition-colors ${
                  isLayoutMode 
                    ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title={isLayoutMode ? "Desativar modo de organização" : "Ativar modo de organização"}
              >
                📌
              </button>
              
              {isLayoutMode && (
                <>
                  <button 
                    onClick={unfixAllNodes}
                    className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Liberar todos os nós"
                  >
                    🔓
                  </button>
                  <button 
                    onClick={pauseSimulation}
                    className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Pausar simulação"
                  >
                    ⏸️
                  </button>
                  <button 
                    onClick={resumeSimulation}
                    className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    title="Retomar simulação"
                  >
                    ▶️
                  </button>
                </>
              )}
            </div>

            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Rede Familiar Interativa</strong><br/>
                • Layout por gerações<br/>
                • Arraste os nós para reorganizar<br/>
                • Zoom/Pan interativo<br/>
                • Linhas sólidas: parentesco<br/>
                • Linhas tracejadas: casamento<br/>
                • Linhas pontilhadas: irmãos<br />
                {isLayoutMode ? (
                  <>
                    • <span className="text-amber-600 font-bold">Modo Organização ATIVO</span>
                    {/* • Nós ficam fixos onde posicionados<br/>*/}
                    {/* • Bordas douradas = nós fixos */}
                  </>
                ) : (
                  <>
                    • Clique em 📌 para ativar modo organização
                  </>
                )}
                {currentUser && (
                  <>
                    <br/>• Usuário: {currentUser.name}
                  </>
                )}
                {DEBUG_MODE && (
                  <>
                    <br/>• 🐛 Debug Mode: ON
                  </>
                )}
              </p>
            </div>

            {/* Botão para ativar debug (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-4 right-1/2 transform translate-x-1/2">
                <button 
                  onClick={() => {
                    window.location.href = window.location.href + (DEBUG_MODE ? '' : '?debug=true');
                  }}
                  className="bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold hover:bg-yellow-400"
                >
                  🐛 {DEBUG_MODE ? 'Debug ON' : 'Debug OFF'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}