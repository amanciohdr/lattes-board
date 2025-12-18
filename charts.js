// MÓDULO: charts.js
// Funções para criar e gerenciar gráficos

let artigosChart = null;
let instituicoesChart = null;
let nacionalidadeChart = null;
let formacaoChart = null;
let idiomasChart = null;
let bancasChart = null;

function criarGraficos(resultados) {
    criarGraficoArtigos(resultados);
    criarGraficoInstituicoes(resultados);
    criarGraficoNacionalidade(resultados);
    criarGraficoFormacao(resultados);
    criarGraficoIdiomas(resultados);
    criarGraficoBancas(resultados);
    criarNuvemPalavras(resultados);
    criarRedeColaboracao(resultados);
}

function criarGraficoArtigos(resultados) {
    const nomes = resultados.map(r => r.nome.split(' ').slice(0, 2).join(' '));
    const artigos = resultados.map(r => r.artigos);

    if (artigosChart) artigosChart.destroy();
    const ctx = document.getElementById('artigosChart').getContext('2d');
    artigosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [{
                label: 'Artigos Publicados',
                data: artigos,
                backgroundColor: 'rgba(7, 68, 156, 0.8)',
                borderColor: '#07449c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function criarGraficoInstituicoes(resultados) {
    const instituicoes = {};
    resultados.forEach(r => {
        if (r.instituicaoAtual !== 'Não informado') {
            instituicoes[r.instituicaoAtual] = (instituicoes[r.instituicaoAtual] || 0) + 1;
        }
    });

    if (instituicoesChart) instituicoesChart.destroy();
    const ctx = document.getElementById('instituicoesChart').getContext('2d');
    instituicoesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(instituicoes),
            datasets: [{
                data: Object.values(instituicoes),
                backgroundColor: [
                    'rgba(7, 68, 156, 0.9)',
                    'rgba(51, 104, 183, 0.9)',
                    'rgba(74, 140, 205, 0.9)',
                    'rgba(145, 196, 236, 0.9)',
                    'rgba(68, 76, 84, 0.9)'
                ],
                borderWidth: 2,
                borderColor: '#fefefe'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function criarGraficoNacionalidade(resultados) {
    const nacionalidades = {};
    resultados.forEach(r => {
        const nac = r.nacionalidade || 'Não informado';
        nacionalidades[nac] = (nacionalidades[nac] || 0) + 1;
    });

    if (nacionalidadeChart) nacionalidadeChart.destroy();
    const ctx = document.getElementById('nacionalidadeChart').getContext('2d');
    nacionalidadeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(nacionalidades),
            datasets: [{
                data: Object.values(nacionalidades),
                backgroundColor: [
                    'rgba(7, 68, 156, 0.9)',
                    'rgba(51, 104, 183, 0.9)',
                    'rgba(74, 140, 205, 0.9)',
                    'rgba(145, 196, 236, 0.9)',
                    'rgba(68, 76, 84, 0.9)'
                ],
                borderWidth: 2,
                borderColor: '#fefefe'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function criarGraficoFormacao(resultados) {
    const formacoes = {
        'Pós-Doutorado': 0,
        'Doutorado': 0,
        'Mestrado': 0,
        'Especialização': 0,
        'Graduação': 0
    };

    resultados.forEach(r => {
        if (r.formacoes) {
            r.formacoes.forEach(f => {
                if (formacoes.hasOwnProperty(f.tipo)) {
                    formacoes[f.tipo]++;
                }
            });
        }
    });

    // Remove categorias vazias
    const labels = Object.keys(formacoes).filter(k => formacoes[k] > 0);
    const data = labels.map(k => formacoes[k]);

    if (formacaoChart) formacaoChart.destroy();
    const ctx = document.getElementById('formacaoChart').getContext('2d');
    formacaoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade de Titulações',
                data: data,
                backgroundColor: [
                    'rgba(7, 68, 156, 0.8)',
                    'rgba(8, 69, 156, 0.8)',
                    'rgba(51, 104, 183, 0.8)',
                    'rgba(74, 140, 205, 0.8)',
                    'rgba(145, 196, 236, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function criarGraficoIdiomas(resultados) {
    const idiomas = {};
    resultados.forEach(r => {
        if (r.idiomas) {
            r.idiomas.forEach(idioma => {
                idiomas[idioma] = (idiomas[idioma] || 0) + 1;
            });
        }
    });

    // Ordena por quantidade
    const sorted = Object.entries(idiomas).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(s => s[0]);
    const data = sorted.map(s => s[1]);

    if (idiomasChart) idiomasChart.destroy();
    const ctx = document.getElementById('idiomasChart').getContext('2d');
    idiomasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pesquisadores',
                data: data,
                backgroundColor: 'rgba(74, 140, 205, 0.8)',
                borderColor: '#4a8ccd',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function criarGraficoBancas(resultados) {
    const nomes = resultados.map(r => r.nome.split(' ').slice(0, 2).join(' '));
    const graduacao = resultados.map(r => r.bancas ? r.bancas.graduacao : 0);
    const mestrado = resultados.map(r => r.bancas ? r.bancas.mestrado : 0);
    const doutorado = resultados.map(r => r.bancas ? r.bancas.doutorado : 0);

    if (bancasChart) bancasChart.destroy();
    const ctx = document.getElementById('bancasChart').getContext('2d');
    bancasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                {
                    label: 'Graduação',
                    data: graduacao,
                    backgroundColor: 'rgba(145, 196, 236, 0.8)'
                },
                {
                    label: 'Mestrado',
                    data: mestrado,
                    backgroundColor: 'rgba(51, 104, 183, 0.8)'
                },
                {
                    label: 'Doutorado',
                    data: doutorado,
                    backgroundColor: 'rgba(7, 68, 156, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: { stacked: true },
                y: { 
                    stacked: true,
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function criarNuvemPalavras(resultados) {
    // Coleta dados separados
    const grandesAreas = {};
    const areas = {};
    const subAreas = {};
    
    resultados.forEach(r => {
        if (r.areasAtuacao) {
            r.areasAtuacao.grandesAreas.forEach(area => {
                grandesAreas[area] = (grandesAreas[area] || 0) + 1;
            });
            r.areasAtuacao.areas.forEach(area => {
                areas[area] = (areas[area] || 0) + 1;
            });
            r.areasAtuacao.subAreas.forEach(area => {
                subAreas[area] = (subAreas[area] || 0) + 1;
            });
        }
    });
    
    // Paletas de cores baseadas na nova paleta
    const paletaGrandesAreas = ['#07449c', '#08459c', '#3368b7', '#4a8ccd', '#91c4ec', '#444c54'];
    const paletaAreas = ['#08459c', '#3368b7', '#4a8ccd', '#91c4ec', '#07449c', '#444c54'];
    const paletaSubAreas = ['#3368b7', '#4a8ccd', '#91c4ec', '#07449c', '#08459c', '#444c54'];
    
    criarNuvemIndividual('wordCloudGrandesAreas', grandesAreas, paletaGrandesAreas);
    criarNuvemIndividual('wordCloudAreas', areas, paletaAreas);
    criarNuvemIndividual('wordCloudSubAreas', subAreas, paletaSubAreas);
}

function criarNuvemIndividual(containerId, palavras, paleta) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Object.keys(palavras).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-style: italic;">Nenhum dado encontrado</p>';
        return;
    }
    
    // Ordena por frequência
    const sorted = Object.entries(palavras).sort((a, b) => b[1] - a[1]);
    const maxFreq = sorted[0][1];
    const minFreq = sorted[sorted.length - 1][1];
    
    // Rotações possíveis para efeito visual
    const rotacoes = [-15, -10, -5, 0, 0, 0, 5, 10, 15];
    
    // Cria os elementos
    sorted.forEach(([palavra, freq], index) => {
        const span = document.createElement('span');
        span.className = 'word-cloud-item';
        span.textContent = palavra;
        
        // Calcula tamanho baseado na frequência (entre 1em e 2.8em)
        const range = maxFreq - minFreq || 1;
        const normalized = (freq - minFreq) / range;
        const tamanho = 1 + normalized * 1.8;
        
        // Seleciona cor da paleta
        const cor = paleta[index % paleta.length];
        
        // Rotação aleatória para efeito de nuvem
        const rotacao = rotacoes[Math.floor(Math.random() * rotacoes.length)];
        
        span.style.cssText = `
            font-size: ${tamanho}em;
            color: ${cor};
            padding: 4px 12px;
            display: inline-block;
            margin: 2px 4px;
            font-weight: ${normalized > 0.5 ? 'bold' : 'normal'};
            transform: rotate(${rotacao}deg);
            transition: all 0.3s ease;
            cursor: default;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Efeito hover
        span.addEventListener('mouseenter', () => {
            span.style.transform = 'scale(1.15) rotate(0deg)';
            span.style.textShadow = '2px 2px 4px rgba(0,0,0,0.2)';
        });
        span.addEventListener('mouseleave', () => {
            span.style.transform = `rotate(${rotacao}deg)`;
            span.style.textShadow = 'none';
        });
        
        container.appendChild(span);
    });
}

// ============================================================
// REDE DE COLABORAÇÃO
// ============================================================

function criarRedeColaboracao(resultados) {
    const container = document.getElementById('networkContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Coleta todas as colaborações
    const todasColaboracoes = [];
    resultados.forEach(r => {
        if (r.colaboracoes) {
            r.colaboracoes.forEach(c => {
                todasColaboracoes.push(c);
            });
        }
    });
    
    if (todasColaboracoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-style: italic; padding: 40px;">Nenhuma colaboração encontrada no período</p>';
        return;
    }
    
    // Cria estrutura de nós e arestas
    const nodes = new Map();
    const edges = new Map();
    
    todasColaboracoes.forEach(colab => {
        const autores = colab.autores;
        
        // Adiciona nós
        autores.forEach(autor => {
            if (!nodes.has(autor)) {
                nodes.set(autor, { id: autor, count: 0 });
            }
            nodes.get(autor).count++;
        });
        
        // Adiciona arestas (conexões entre coautores)
        for (let i = 0; i < autores.length; i++) {
            for (let j = i + 1; j < autores.length; j++) {
                const key = [autores[i], autores[j]].sort().join('|||');
                if (!edges.has(key)) {
                    edges.set(key, { source: autores[i], target: autores[j], weight: 0 });
                }
                edges.get(key).weight++;
            }
        }
    });
    
    // Converte para arrays
    const nodesArray = Array.from(nodes.values());
    const edgesArray = Array.from(edges.values());
    
    // Cria SVG
    const width = container.offsetWidth || 800;
    const height = 600;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.background = '#fafafa';
    svg.style.borderRadius = '8px';
    container.appendChild(svg);
    
    // Simulação de força
    const simulation = new ForceSimulation(nodesArray, edgesArray, width, height);
    simulation.run(300);
    
    // Desenha arestas
    edgesArray.forEach(edge => {
        const sourceNode = nodesArray.find(n => n.id === edge.source);
        const targetNode = nodesArray.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourceNode.x);
            line.setAttribute('y1', sourceNode.y);
            line.setAttribute('x2', targetNode.x);
            line.setAttribute('y2', targetNode.y);
            line.setAttribute('stroke', '#4a8ccd');
            line.setAttribute('stroke-width', Math.min(edge.weight * 1.5, 5));
            line.setAttribute('stroke-opacity', 0.4);
            svg.appendChild(line);
        }
    });
    
    // Desenha nós
    const maxCount = Math.max(...nodesArray.map(n => n.count));
    
    nodesArray.forEach(node => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.style.cursor = 'pointer';
        
        // Círculo
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = 6 + (node.count / maxCount) * 14;
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', '#07449c');
        circle.setAttribute('stroke', '#fefefe');
        circle.setAttribute('stroke-width', 2);
        
        // Tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${node.id}\n${node.count} artigo(s)`;
        circle.appendChild(title);
        
        group.appendChild(circle);
        
        // Texto só para nós com mais artigos (evita poluição visual)
        if (node.count >= Math.max(1, maxCount * 0.3)) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y + radius + 12);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '9px');
            text.setAttribute('fill', '#333');
            text.setAttribute('font-weight', 'bold');
            text.textContent = node.id.split(',')[0];
            group.appendChild(text);
        }
        
        svg.appendChild(group);
    });
    
    // Adiciona legenda
    const legenda = document.createElement('div');
    legenda.style.cssText = 'text-align: center; margin-top: 15px; font-size: 0.85em; color: #666;';
    legenda.innerHTML = `<strong>${nodesArray.length}</strong> autores · <strong>${edgesArray.length}</strong> conexões · <strong>${todasColaboracoes.length}</strong> artigos em colaboração`;
    container.appendChild(legenda);
}

// Simulação de força melhorada
class ForceSimulation {
    constructor(nodes, edges, width, height) {
        this.nodes = nodes;
        this.edges = edges;
        this.width = width;
        this.height = height;
        
        // Posições iniciais em círculo
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;
        
        this.nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / this.nodes.length;
            node.x = centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50;
            node.y = centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50;
            node.vx = 0;
            node.vy = 0;
        });
    }
    
    run(iterations) {
        for (let i = 0; i < iterations; i++) {
            this.tick(1 - i / iterations);
        }
    }
    
    tick(alpha) {
        // Repulsão entre nós (mais forte)
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];
                
                let dx = nodeB.x - nodeA.x;
                let dy = nodeB.y - nodeA.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                // Repulsão mais forte para evitar sobreposição
                const minDist = 60;
                if (dist < minDist) {
                    const repulsion = (minDist - dist) * 0.5;
                    const fx = (dx / dist) * repulsion;
                    const fy = (dy / dist) * repulsion;
                    nodeA.vx -= fx;
                    nodeA.vy -= fy;
                    nodeB.vx += fx;
                    nodeB.vy += fy;
                } else {
                    const repulsion = 2000 / (dist * dist);
                    nodeA.vx -= (dx / dist) * repulsion * alpha;
                    nodeA.vy -= (dy / dist) * repulsion * alpha;
                    nodeB.vx += (dx / dist) * repulsion * alpha;
                    nodeB.vy += (dy / dist) * repulsion * alpha;
                }
            }
        }
        
        // Atração das arestas
        this.edges.forEach(edge => {
            const source = this.nodes.find(n => n.id === edge.source);
            const target = this.nodes.find(n => n.id === edge.target);
            
            if (source && target) {
                let dx = target.x - source.x;
                let dy = target.y - source.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                const idealDist = 100;
                const attraction = (dist - idealDist) * 0.02 * edge.weight;
                
                source.vx += (dx / dist) * attraction * alpha;
                source.vy += (dy / dist) * attraction * alpha;
                target.vx -= (dx / dist) * attraction * alpha;
                target.vy -= (dy / dist) * attraction * alpha;
            }
        });
        
        // Força central suave
        this.nodes.forEach(node => {
            const dx = this.width / 2 - node.x;
            const dy = this.height / 2 - node.y;
            node.vx += dx * 0.002 * alpha;
            node.vy += dy * 0.002 * alpha;
        });
        
        // Aplica velocidade com fricção
        this.nodes.forEach(node => {
            node.vx *= 0.85;
            node.vy *= 0.85;
            
            node.x += node.vx;
            node.y += node.vy;
            
            // Mantém dentro dos limites com margem
            const margin = 60;
            node.x = Math.max(margin, Math.min(this.width - margin, node.x));
            node.y = Math.max(margin, Math.min(this.height - margin, node.y));
        });
    }
}
