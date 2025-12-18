// MÓDULO: main.js
// Arquivo principal que coordena todos os módulos

let curriculos = [];
let resultados = [];

const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const analyzeBtn = document.getElementById('analyzeBtn');
const startYearInput = document.getElementById('startYear');
const endYearInput = document.getElementById('endYear');
const errorDiv = document.getElementById('error');

const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    });
});

fileInput.addEventListener('change', handleFileSelect);
analyzeBtn.addEventListener('click', analyzeCurriculos);
document.getElementById('exportBtn').addEventListener('click', () => exportCSV(resultados));
startYearInput.addEventListener('input', checkEnableButton);
endYearInput.addEventListener('input', checkEnableButton);

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    fileList.innerHTML = '';
    
    if (files.length > 0) {
        // Mostra apenas a quantidade de arquivos selecionados
        fileList.innerHTML = `<p style="color: #1e3a5f; font-weight: bold; margin-top: 15px;">${files.length} arquivo${files.length > 1 ? 's' : ''} selecionado${files.length > 1 ? 's' : ''}</p>`;
        readFiles(files);
    }
}

function readFiles(files) {
    curriculos = [];
    let processed = 0;

    files.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            curriculos.push({
                nome: file.name,
                conteudo: e.target.result
            });
            processed++;
            
            if (processed === files.length) {
                checkEnableButton();
            }
        };
        
        reader.onerror = function() {
            showError(`Erro ao ler o arquivo: ${file.name}`);
        };
        
        reader.readAsText(file, 'UTF-8');
    });
}

function checkEnableButton() {
    const hasFiles = curriculos.length > 0;
    const hasYears = startYearInput.value && endYearInput.value;
    analyzeBtn.disabled = !(hasFiles && hasYears);
}

function analyzeCurriculos() {
    errorDiv.classList.remove('show');
    const startYear = parseInt(startYearInput.value);
    const endYear = parseInt(endYearInput.value);

    if (startYear > endYear) {
        showError('O ano inicial deve ser menor ou igual ao ano final!');
        return;
    }

    resultados = [];

    curriculos.forEach(curriculo => {
        const resultado = analisarCurriculo(curriculo.conteudo, startYear, endYear);
        resultados.push(resultado);
    });

    exibirResultados(resultados);
}
