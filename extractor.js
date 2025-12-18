// MÓDULO: extractor.js
// Funções para extrair informações dos currículos Lattes
//
// Atualização: Ajustado para o formato real dos arquivos TXT do Lattes

function extrairNome(texto) {
    const match = texto.match(/Identificação\s+Nome\s+([^\n]+)/i);
    if (match) {
        return match[1].trim().replace(/Dados cadastrais.*$/i, '').trim();
    }

    const match2 = texto.match(/^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß][a-zà-ú]+(?:\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß][a-zà-ú]+)+)/m);
    return match2 ? match2[1].trim() : 'Nome não encontrado';
}

// Normaliza título para deduplicação
function normalizarTitulo(titulo) {
    return (titulo || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u2010-\u2015]/g, '-')
        .replace(/[^a-z0-9\s\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Retorna o último ano (4 dígitos) encontrado em uma entrada
function extrairAnoDaEntrada(entrada) {
    const anos = entrada.match(/\b(19|20)\d{2}\b/g);
    if (!anos || anos.length === 0) return null;
    const ultimo = parseInt(anos[anos.length - 1], 10);
    return Number.isFinite(ultimo) ? ultimo : null;
}

// ============================================================
// Extrai título usando o REGEX DO USUÁRIO
// Regex: \.\s*([^.]+)\.\s+(?:In:|[A-Z][A-Z\s]+\(|v\.)
// ============================================================
function extrairTituloDaEntrada(entrada) {
    if (!entrada) return null;

    // Colapsa quebras de linha e espaços múltiplos
    let linha = entrada.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Corrige caracteres problemáticos (apóstrofos curvos, etc.)
    linha = linha
        .replace(/['']/g, "'")      // apóstrofos curvos -> reto
        .replace(/[""]/g, '"')      // aspas curvas -> retas
        .replace(/…/g, '...')       // reticências
        .replace(/[–—]/g, '-');     // travessões -> hífen

    // Método 1: Separador " . " (espaço-ponto-espaço) - padrão comum do Lattes
    // Formato: AUTORES . TÍTULO . REVISTA, v. X, p. Y, ANO.
    const partes = linha.split(/ \. /);
    if (partes.length >= 2) {
        for (let i = 1; i < partes.length; i++) {
            let candidato = partes[i].trim();
            
            // Remove possível revista anexada - vários padrões:
            // 1. "TÍTULO. REVISTA, v." 
            // 2. "TÍTULO. REVISTA (LOCAL), v."
            // 3. "TÍTULO. REVISTA. v." (menos comum)
            
            // Padrão: ponto + espaço + NOME_REVISTA + (vírgula ou parêntese) + ... + v.
            const regexRevista = /\.\s+[A-Z][A-Za-zÀ-ÿ\s&]+[\s]*[\(,][^.]*v\./;
            const matchRevista = candidato.match(regexRevista);
            if (matchRevista) {
                candidato = candidato.substring(0, matchRevista.index).trim();
            }
            
            // Título válido: tem pelo menos 15 chars e não é só siglas/nomes curtos
            if (candidato.length >= 15 && !candidato.match(/^[A-Z]\.\s*[A-Z]\./)) {
                const numSeparadores = (candidato.match(/;/g) || []).length;
                if (numSeparadores < 2) {
                    // Limpeza final: remove revista se ainda estiver grudada
                    candidato = limparRevistaDoTitulo(candidato);
                    return candidato;
                }
            }
        }
    }

    // Método 2: Para formato SEM " . " - ex: "AUTORES. TÍTULO. REVISTA, v."
    // Captura texto entre ". " e ". REVISTA" onde REVISTA é seguido de ", v." ou "(LOCAL), v."
    const regexSemEspaco = /\.\s+([^.]{15,}?)\.\s+[A-Z][A-Za-zÀ-ÿ\s&]+[\s]*[\(,][^.]*v\./;
    const matchSemEspaco = linha.match(regexSemEspaco);
    if (matchSemEspaco && matchSemEspaco[1]) {
        const titulo = matchSemEspaco[1].trim();
        const numSeparadores = (titulo.match(/;/g) || []).length;
        if (numSeparadores < 2) {
            return titulo;
        }
    }

    // Método 3: REGEX DO USUÁRIO original
    const regexTitulo = /\.\s+([^.]{15,}?)\.\s+(?:In:|[A-Z][A-Z\s&]*[A-Z]\s*[\(,]|v\.)/;
    const match = linha.match(regexTitulo);
    
    if (match && match[1]) {
        const titulo = match[1].trim();
        const numSeparadores = (titulo.match(/;/g) || []).length;
        if (titulo.length >= 15 && numSeparadores < 2) {
            return titulo;
        }
    }

    // Método 4: Fallback - procura título em CAPS
    const regexCaps = /\.\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ][^.]{14,}?)\.\s+[A-Z]/;
    const matchCaps = linha.match(regexCaps);
    if (matchCaps && matchCaps[1]) {
        const titulo = matchCaps[1].trim();
        const numSeparadores = (titulo.match(/;/g) || []).length;
        if (numSeparadores < 2) {
            return titulo;
        }
    }

    return null;
}

// Função auxiliar para remover revista grudada no final do título
function limparRevistaDoTitulo(titulo) {
    if (!titulo) return titulo;
    
    // Padrão: "Título. nome da revista, v. X" ou "Título. nome da revista (local), v. X"
    // A revista geralmente começa com letra minúscula após o ponto
    const regexRevistaGrudada = /\.\s+[a-z][a-zA-ZÀ-ÿ\s&]+,\s*v\.\s*\d+.*$/i;
    const match = titulo.match(regexRevistaGrudada);
    if (match) {
        return titulo.substring(0, match.index).trim();
    }
    
    // Padrão alternativo: revista em CAPS grudada - ex: "TÍTULO. BRAZILIAN JOURNAL, v. 7"
    const regexRevistaCaps = /\.\s+[A-Z][A-Z\s&]+,\s*v\.\s*\d+.*$/;
    const matchCaps = titulo.match(regexRevistaCaps);
    if (matchCaps) {
        return titulo.substring(0, matchCaps.index).trim();
    }
    
    return titulo;
}

// ============================================================
// Coleta seção de artigos usando REGEX DO USUÁRIO para sessão
// ============================================================
function coletarTrechosDeArtigos(texto) {
    const trechos = [];
    
    // Encontra todas as ocorrências de "Artigos completos publicados em periódicos"
    const marcador = /Artigos completos publicados em periódicos/gi;
    const posicoes = [];
    let m;
    while ((m = marcador.exec(texto)) !== null) {
        posicoes.push(m.index);
    }
    
    if (posicoes.length === 0) return [];

    // Marcadores que indicam fim da seção de artigos
    const fimSecao = [
        'Resumos publicados',
        'Resumos expandidos',
        'Apresentações de Trabalho',
        'Livros publicados',
        'Capítulos de livros',
        'Textos em jornais',
        'Demais tipos de produção',
        'Produção técnica',
        'Trabalhos em eventos',
        'Outras produções',
        'Organização de eventos',
        'Inovação',
        'Eventos',
        'Orientações'
    ];
    const regexFim = new RegExp(`^\\s*(${fimSecao.join('|')})`, 'im');

    for (let i = 0; i < posicoes.length; i++) {
        const start = posicoes[i];
        // Limite: próxima seção de artigos ou fim do texto
        const end = (i + 1 < posicoes.length) ? posicoes[i + 1] : texto.length;
        const secao = texto.slice(start, end);
        
        // REGEX DO USUÁRIO para capturar bloco após "Ordem Cronológica"
        // (?ms)Ordem Cronológica\s*\r?\n(...)
        const regexSessao = /Ordem\s+Cronológica\s*\r?\n([\s\S]+)/i;
        const matchSessao = secao.match(regexSessao);
        
        if (matchSessao && matchSessao[1]) {
            let bloco = matchSessao[1];
            
            // Corta no primeiro marcador de fim de seção
            const fimMatch = bloco.match(regexFim);
            if (fimMatch && fimMatch.index != null) {
                bloco = bloco.slice(0, fimMatch.index);
            }
            
            if (bloco.trim().length > 0) {
                trechos.push(bloco.trim());
            }
        }
    }

    return trechos;
}

// Divide bloco numerado em entradas individuais
function dividirEmEntradas(trecho) {
    const texto = (trecho || '').replace(/\r/g, '');
    
    // Padrão do Lattes: número em linha isolada (ex: "1.\n" ou "1. \n")
    // O REGEX DO USUÁRIO: \s*\d+\.\s*\r?\n
    const indices = [];
    const re = /^\s*\d+\.\s*$/gm;
    let m;
    while ((m = re.exec(texto)) !== null) {
        indices.push({ pos: m.index, len: m[0].length });
    }
    
    if (indices.length === 0) return [];

    const entradas = [];
    for (let i = 0; i < indices.length; i++) {
        const startContent = indices[i].pos + indices[i].len;
        const endContent = (i + 1 < indices.length) ? indices[i + 1].pos : texto.length;
        const chunk = texto.slice(startContent, endContent).trim();
        if (chunk.length > 0) entradas.push(chunk);
    }
    return entradas;
}

function extrairArtigos(texto, anoInicio, anoFim) {
    const trechos = coletarTrechosDeArtigos(texto);
    
    if (trechos.length === 0) {
        return { count: 0, titulos: [] };
    }

    const titulos = [];
    const vistos = new Set();

    trechos.forEach(trecho => {
        const entradas = dividirEmEntradas(trecho);

        entradas.forEach(ent => {
            const ano = extrairAnoDaEntrada(ent);
            if (ano == null) return;
            if (ano < anoInicio || ano > anoFim) return;

            const titulo = extrairTituloDaEntrada(ent);
            if (!titulo || titulo.length < 10) return;

            const key = normalizarTitulo(titulo);
            if (!key) return;

            if (!vistos.has(key)) {
                vistos.add(key);
                titulos.push(titulo.trim());
            }
        });
    });

    return { count: titulos.length, titulos };
}

function extrairInstituicaoAtual(texto) {
    const atuacaoSecao = texto.match(/Atuação Profissional([\s\S]*?)(?=Projetos de pesquisa|Projetos de extensão|Áreas de atuação|Idiomas|$)/i);

    if (!atuacaoSecao) return 'Não informado';

    const conteudo = atuacaoSecao[1];
    const regex = /(\d{4})\s*-\s*Atual/gi;
    let match;
    const instituicoes = [];

    while ((match = regex.exec(conteudo)) !== null) {
        const posicao = match.index;
        const textoAntes = conteudo.substring(Math.max(0, posicao - 500), posicao);
        const linhasAntes = textoAntes.split('\n').reverse();

        for (let linha of linhasAntes) {
            linha = linha.trim();

            if (!linha || linha.length < 5) continue;
            if (linha.match(/^Vínculo/i)) continue;
            if (linha.match(/^Enquadramento/i)) continue;
            if (linha.match(/^Regime/i)) continue;
            if (linha.match(/^Carga horária/i)) continue;
            if (linha.match(/^\d{4}\s*-/)) continue;

            if (linha.match(/,\s*[A-Z]+,\s*Brasil/i)) {
                const nomeInst = linha.replace(/,\s*[A-Z]+,\s*Brasil\.?$/i, '').trim();
                if (nomeInst.length > 5) {
                    instituicoes.push(nomeInst);
                    break;
                }
            }

            if (linha.match(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞß]/)) {
                const nomeInst = linha.replace(/,\s*[A-Z]+,.*$/i, '').trim();
                if (nomeInst.length > 5 && !nomeInst.match(/^\d/)) {
                    instituicoes.push(nomeInst);
                    break;
                }
            }
        }
    }

    return instituicoes.length > 0 ? instituicoes[0] : 'Não informado';
}

function analisarCurriculo(texto, anoInicio, anoFim) {
    const nome = extrairNome(texto);
    const artigosData = extrairArtigos(texto, anoInicio, anoFim);
    const instituicaoAtual = extrairInstituicaoAtual(texto);
    const nacionalidade = extrairNacionalidade(texto);
    const formacoes = extrairFormacaoAcademica(texto);
    const areasAtuacao = extrairAreasAtuacao(texto);
    const idiomas = extrairIdiomas(texto);
    const bancas = contarBancas(texto);
    const colaboracoes = extrairColaboracoes(texto, anoInicio, anoFim);

    return {
        nome,
        artigos: artigosData.count,
        titulos: artigosData.titulos,
        instituicaoAtual,
        nacionalidade,
        formacoes,
        areasAtuacao,
        idiomas,
        bancas,
        colaboracoes
    };
}

// ============================================================
// EXTRAÇÃO DE COLABORAÇÕES (COAUTORIAS)
// ============================================================

function normalizarNomeAutor(nome) {
    // Remove espaços extras e normaliza
    let n = (nome || '').trim();
    // Remove números e caracteres especiais do início
    n = n.replace(/^\d+\.\s*/, '').trim();
    return n;
}

function extrairAutoresDaEntrada(entrada) {
    if (!entrada) return [];
    
    // Colapsa quebras de linha
    const linha = entrada.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Autores vêm antes do primeiro " . " (espaço-ponto-espaço)
    const partes = linha.split(/ \. /);
    if (partes.length < 2) return [];
    
    const autoresStr = partes[0];
    
    // Separa por " ; " (espaço-ponto-vírgula-espaço)
    const autores = autoresStr.split(/\s*;\s*/)
        .map(a => normalizarNomeAutor(a))
        .filter(a => a.length > 2 && a.includes(','));  // Nome válido tem vírgula (SOBRENOME, INICIAIS)
    
    return autores;
}

function extrairColaboracoes(texto, anoInicio, anoFim) {
    const colaboracoes = [];
    const trechos = coletarTrechosDeArtigos(texto);
    
    if (trechos.length === 0) return colaboracoes;
    
    trechos.forEach(trecho => {
        const entradas = dividirEmEntradas(trecho);
        
        entradas.forEach(ent => {
            const ano = extrairAnoDaEntrada(ent);
            if (ano == null) return;
            if (ano < anoInicio || ano > anoFim) return;
            
            const titulo = extrairTituloDaEntrada(ent);
            if (!titulo || titulo.length < 10) return;
            
            const autores = extrairAutoresDaEntrada(ent);
            if (autores.length > 1) {
                colaboracoes.push({
                    titulo: titulo,
                    autores: autores,
                    ano: ano
                });
            }
        });
    });
    
    return colaboracoes;
}

// ============================================================
// NOVAS FUNÇÕES DE EXTRAÇÃO
// ============================================================

function extrairNacionalidade(texto) {
    const match = texto.match(/Pa[íi]s de Nacionalidade\s*\n\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Não informado';
}

function extrairFormacaoAcademica(texto) {
    const formacoes = [];
    
    // Encontra a seção de formação acadêmica
    const secao = texto.match(/Formação acadêmica\/titulação([\s\S]*?)(?=Formação Complementar|Atuação Profissional|$)/i);
    if (!secao) return formacoes;
    
    const conteudo = secao[1];
    
    // Padrões de titulação
    const padroes = [
        { regex: /Doutorado(?:\s+em\s+andamento)?\s+em\s+([^\n.]+)/gi, tipo: 'Doutorado' },
        { regex: /Mestrado(?:\s+em\s+andamento)?\s+em\s+([^\n.]+)/gi, tipo: 'Mestrado' },
        { regex: /Especialização\s+em\s+([^\n.]+)/gi, tipo: 'Especialização' },
        { regex: /Graduação(?:\s+em\s+andamento)?\s+em\s+([^\n.]+)/gi, tipo: 'Graduação' },
        { regex: /Pós-[Dd]outorado/gi, tipo: 'Pós-Doutorado' },
        { regex: /Livre-[Dd]ocência/gi, tipo: 'Livre-Docência' }
    ];
    
    padroes.forEach(padrao => {
        let match;
        while ((match = padrao.regex.exec(conteudo)) !== null) {
            const emAndamento = match[0].toLowerCase().includes('andamento');
            formacoes.push({
                tipo: padrao.tipo,
                area: match[1] ? match[1].trim() : '',
                emAndamento
            });
        }
    });
    
    return formacoes;
}

function extrairAreasAtuacao(texto) {
    const areas = {
        grandesAreas: [],
        areas: [],
        subAreas: []
    };
    
    // Encontra a seção de áreas de atuação
    const secao = texto.match(/Áreas de atuação([\s\S]*?)(?=Idiomas|Prêmios|Produções|$)/i);
    if (!secao) return areas;
    
    const conteudo = secao[1];
    
    // Extrai Grande área, Área e Subárea
    const linhas = conteudo.split('\n');
    linhas.forEach(linha => {
        // Padrão: "Grande área: X / Área: Y / Subárea: Z"
        const grandeArea = linha.match(/Grande [áa]rea:\s*([^\/\n]+)/i);
        const area = linha.match(/[^Grande]\s*[Áá]rea:\s*([^\/\n]+)/i);
        const subArea = linha.match(/Sub[áa]rea:\s*([^\/\n.]+)/i);
        
        if (grandeArea) {
            const ga = grandeArea[1].trim();
            if (ga && !areas.grandesAreas.includes(ga)) {
                areas.grandesAreas.push(ga);
            }
        }
        if (area) {
            const a = area[1].trim();
            if (a && !areas.areas.includes(a)) {
                areas.areas.push(a);
            }
        }
        if (subArea) {
            const sa = subArea[1].trim();
            if (sa && !areas.subAreas.includes(sa)) {
                areas.subAreas.push(sa);
            }
        }
    });
    
    return areas;
}

function extrairIdiomas(texto) {
    const idiomas = [];
    
    // Encontra a seção de idiomas
    const secao = texto.match(/Idiomas([\s\S]*?)(?=Prêmios|Produções|Áreas de atuação|Atuação Profissional|$)/i);
    if (!secao) return idiomas;
    
    const conteudo = secao[1];
    const linhas = conteudo.split('\n');
    
    // Idiomas comuns
    const idiomasConhecidos = ['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Japonês', 'Chinês', 'Mandarim', 'Coreano', 'Russo', 'Árabe', 'Hebraico', 'Latim', 'Libras'];
    
    linhas.forEach(linha => {
        const linhaLimpa = linha.trim();
        idiomasConhecidos.forEach(idioma => {
            if (linhaLimpa === idioma || linhaLimpa.startsWith(idioma + ' ')) {
                if (!idiomas.includes(idioma)) {
                    idiomas.push(idioma);
                }
            }
        });
    });
    
    return idiomas;
}

function contarBancas(texto) {
    const resultado = {
        total: 0,
        graduacao: 0,
        mestrado: 0,
        doutorado: 0,
        qualificacao: 0
    };
    
    // Encontra a seção de bancas
    const secao = texto.match(/Bancas([\s\S]*?)(?=Eventos|Orientações|Página gerada|$)/i);
    if (!secao) return resultado;
    
    const conteudo = secao[1];
    
    // Conta participações em bancas de graduação
    const graduacao = conteudo.match(/Trabalhos de conclusão de curso de graduação([\s\S]*?)(?=Dissertações de mestrado|Teses de doutorado|Qualificações|Exames de qualificação|\n\n\n|$)/i);
    if (graduacao) {
        const matches = graduacao[1].match(/^\d+\.\s*$/gm);
        resultado.graduacao = matches ? matches.length : 0;
    }
    
    // Conta participações em bancas de mestrado
    const mestrado = conteudo.match(/Dissertações de mestrado([\s\S]*?)(?=Teses de doutorado|Qualificações|Exames de qualificação|Trabalhos de conclusão|\n\n\n|$)/i);
    if (mestrado) {
        const matches = mestrado[1].match(/^\d+\.\s*$/gm);
        resultado.mestrado = matches ? matches.length : 0;
    }
    
    // Conta participações em bancas de doutorado
    const doutorado = conteudo.match(/Teses de doutorado([\s\S]*?)(?=Qualificações|Exames de qualificação|Trabalhos de conclusão|Dissertações|\n\n\n|$)/i);
    if (doutorado) {
        const matches = doutorado[1].match(/^\d+\.\s*$/gm);
        resultado.doutorado = matches ? matches.length : 0;
    }
    
    // Conta qualificações
    const qualificacao = conteudo.match(/(?:Qualificações|Exames de qualificação)([\s\S]*?)(?=Trabalhos de conclusão|Dissertações|Teses|\n\n\n|$)/i);
    if (qualificacao) {
        const matches = qualificacao[1].match(/^\d+\.\s*$/gm);
        resultado.qualificacao = matches ? matches.length : 0;
    }
    
    resultado.total = resultado.graduacao + resultado.mestrado + resultado.doutorado + resultado.qualificacao;
    
    return resultado;
}
