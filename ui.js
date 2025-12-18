// MÓDULO: ui.js
// Funções de interface e manipulação do DOM

function preencherTabela(resultados) {
    const tbody = document.querySelector('#resultsTable tbody');
    tbody.innerHTML = '';

    resultados.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${res.nome}</td>
            <td>${res.artigos}</td>
            <td>${res.bancas ? res.bancas.total : 0}</td>
            <td>${res.instituicaoAtual}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Função auxiliar para contar artigos únicos (remove duplicatas entre pesquisadores)
function contarArtigosUnicos(resultados) {
    const todosTitulos = new Set();
    resultados.forEach(res => {
        res.titulos.forEach(titulo => {
            const tituloNormalizado = titulo
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s\-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            todosTitulos.add(tituloNormalizado);
        });
    });
    return todosTitulos.size;
}

// Função auxiliar para contar total de bancas
function contarTotalBancas(resultados) {
    return resultados.reduce((sum, r) => sum + (r.bancas ? r.bancas.total : 0), 0);
}

function exibirListaArtigos(resultados) {
    const artigosList = document.getElementById('artigosList');
    const artigosInfo = document.getElementById('artigosInfo');
    
    const titulosMap = new Map();
    resultados.forEach(res => {
        res.titulos.forEach(titulo => {
            const chave = titulo
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (!titulosMap.has(chave)) {
                titulosMap.set(chave, titulo);
            }
        });
    });
    
    const titulosUnicos = Array.from(titulosMap.values()).sort();
    
    artigosInfo.textContent = `Total de ${titulosUnicos.length} artigos únicos encontrados no período`;
    artigosList.innerHTML = '';
    
    if (titulosUnicos.length === 0) {
        artigosList.innerHTML = '<li style="text-align: center; color: #666;">Nenhum artigo encontrado no período selecionado</li>';
        return;
    }
    
    titulosUnicos.forEach((titulo, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="artigo-numero">${index + 1}</span>${titulo}`;
        artigosList.appendChild(li);
    });
}

function exibirResultados(resultados) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.add('show');

    document.getElementById('totalCurriculos').textContent = resultados.length;
    document.getElementById('totalArtigos').textContent = contarArtigosUnicos(resultados);
    
    const instituicoesUnicas = new Set(resultados.map(r => r.instituicaoAtual).filter(i => i !== 'Não informado'));
    document.getElementById('totalInstituicoes').textContent = instituicoesUnicas.size;
    
    document.getElementById('totalBancas').textContent = contarTotalBancas(resultados);

    preencherTabela(resultados);
    criarGraficos(resultados);
    exibirListaArtigos(resultados);
    
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function exportCSV(resultados) {
    let csv = '\uFEFF';
    csv += 'Pesquisador,Artigos no Período,Bancas,Instituição Atual,Nacionalidade,Idiomas\n';
    
    resultados.forEach(res => {
        const idiomas = res.idiomas ? res.idiomas.join('; ') : '';
        const bancas = res.bancas ? res.bancas.total : 0;
        csv += `"${res.nome}",${res.artigos},${bancas},"${res.instituicaoAtual}","${res.nacionalidade}","${idiomas}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analise_lattes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}
