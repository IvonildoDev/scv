// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado');

    // Sidebar toggle - código comum para todas as páginas
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');

    if (menuToggle) {
        menuToggle.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('active');
            mainContent.classList.toggle('sidebar-active');
            console.log('Menu toggle clicked');
        });
    }

    // Fechando sidebar ao clicar fora
    document.addEventListener('click', function (e) {
        if (sidebar && !sidebar.contains(e.target) && e.target !== menuToggle && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('sidebar-active');
        }
    });

    // Detectar qual página está sendo visualizada
    detectCurrentPage();
});

// Detectar a página atual
function detectCurrentPage() {
    // Verifica elementos específicos para identificar cada página
    if (document.getElementById('visitorsList')) {
        console.log('Página de lista de visitantes detectada');
        initVisitorsListPage();
    } else if (document.getElementById('visitorForm')) {
        console.log('Página de cadastro de visitantes detectada');
        initVisitorFormPage();
    }
    // Adicione mais condições para outras páginas conforme necessário
}

// Inicializa a página de lista de visitantes
function initVisitorsListPage() {
    console.log('Inicializando página de lista de visitantes');

    // Exibe a lista de visitantes imediatamente
    displayVisitorsList();

    // Adiciona eventos para os botões - Mantem os event listeners aqui também
    // para garantir dupla camada de segurança
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            searchVisitors();
            console.log('Botão de busca clicado');
        });
    }

    const searchInput = document.getElementById('searchVisitor');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                searchVisitors();
                console.log('Enter pressionado na busca');
            }
        });
    }

    // Usar método direto para garantir que os handlers de evento sejam adicionados
    document.getElementById('generatePDF').onclick = function () {
        console.log('Botão gerar PDF clicado');
        generatePDF();
    };

    document.getElementById('sharePDF').onclick = function () {
        console.log('Botão compartilhar PDF clicado');
        sharePDF();
    };
}

// Inicializa a página de formulário de visitantes
function initVisitorFormPage() {
    console.log('Inicializando página de formulário de visitantes');

    // Código para inicializar o formulário de cadastro
    displayVisitors();

    // Event listener para o formulário
    document.getElementById('visitorForm').addEventListener('submit', function (event) {
        event.preventDefault();
        saveVisitor();
    });

    // Event listener para o botão de limpar histórico
    const clearHistoryBtn = document.getElementById('clearHistory');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function () {
            document.getElementById('confirmationModal').style.display = 'flex';
        });
    }

    // Event listeners para o modal de confirmação
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            document.getElementById('confirmationModal').style.display = 'none';
        });
    }

    const cancelDeleteBtn = document.getElementById('cancelDelete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function () {
            document.getElementById('confirmationModal').style.display = 'none';
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            localStorage.removeItem('visitors');
            document.getElementById('confirmationModal').style.display = 'none';
            displayVisitors();
        });
    }

    // Mostrar/esconder o campo de igreja com base na seleção
    const evangelicalYesRadio = document.getElementById('evangelicalYes');
    if (evangelicalYesRadio) {
        evangelicalYesRadio.addEventListener('change', function () {
            document.getElementById('churchSection').style.display = 'block';
        });
    }

    const evangelicalNoRadio = document.getElementById('evangelicalNo');
    if (evangelicalNoRadio) {
        evangelicalNoRadio.addEventListener('change', function () {
            document.getElementById('churchSection').style.display = 'none';
            document.getElementById('churchName').value = '';
        });
    }
}

// Exibe a lista de visitantes
function displayVisitorsList() {
    console.log('Exibindo lista de visitantes');
    const listContainer = document.getElementById('visitorsList');

    // Verificar se o container existe
    if (!listContainer) {
        console.error('Container de lista não encontrado');
        return;
    }

    // Obter visitantes do localStorage
    let visitors = [];
    try {
        const visitorsJSON = localStorage.getItem('visitors');
        if (visitorsJSON) {
            visitors = JSON.parse(visitorsJSON);
        }
        console.log('Visitantes carregados:', visitors.length);
    } catch (e) {
        console.error('Erro ao carregar visitantes:', e);
        listContainer.innerHTML = '<p class="no-data">Erro ao carregar dados. Por favor, tente novamente.</p>';
        return;
    }

    // Verificar se há visitantes
    if (!visitors || visitors.length === 0) {
        console.log('Nenhum visitante encontrado');
        listContainer.innerHTML = '<p class="no-data">Nenhum visitante cadastrado.</p>';
        return;
    }

    // Construir HTML para os visitantes
    let html = '';
    visitors.forEach(visitor => {
        html += `
            <div class="visitor-card">
                <div class="visitor-info">
                    <h3>${visitor.name}</h3>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>Evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Igreja:</strong> ${visitor.churchName || 'Não informada'}</p>` : ''}
                    <p><strong>Data:</strong> ${visitor.date}</p>
                </div>
                <div class="visitor-actions">
                    <button class="btn-edit" onclick="editVisitor(${visitor.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteVisitor(${visitor.id})">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    });

    // Atualizar o conteúdo do container
    listContainer.innerHTML = html;
    console.log('Lista de visitantes atualizada');
}

// Função para buscar visitantes
function searchVisitors() {
    const searchTerm = document.getElementById('searchVisitor').value.toLowerCase();
    const listContainer = document.getElementById('visitorsList');
    let visitors = [];

    try {
        const visitorsJSON = localStorage.getItem('visitors');
        if (visitorsJSON) {
            visitors = JSON.parse(visitorsJSON);
        }
    } catch (e) {
        console.error('Erro ao carregar visitantes:', e);
        return;
    }

    if (!visitors || visitors.length === 0) {
        listContainer.innerHTML = '<p class="no-data">Nenhum visitante cadastrado.</p>';
        return;
    }

    const filteredVisitors = visitors.filter(visitor =>
        visitor.name.toLowerCase().includes(searchTerm) ||
        visitor.city.toLowerCase().includes(searchTerm)
    );

    if (filteredVisitors.length === 0) {
        listContainer.innerHTML = '<p class="no-data">Nenhum visitante encontrado com esse termo.</p>';
        return;
    }

    let html = '';
    filteredVisitors.forEach(visitor => {
        html += `
            <div class="visitor-card">
                <div class="visitor-info">
                    <h3>${visitor.name}</h3>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>Evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Igreja:</strong> ${visitor.churchName || 'Não informada'}</p>` : ''}
                    <p><strong>Data:</strong> ${visitor.date}</p>
                </div>
                <div class="visitor-actions">
                    <button class="btn-edit" onclick="editVisitor(${visitor.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteVisitor(${visitor.id})">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

// Função para editar visitante
function editVisitor(id) {
    window.location.href = `cadastrovisitantes.html?edit=${id}`;
}

// Função para excluir visitante
function deleteVisitor(id) {
    if (confirm('Tem certeza que deseja excluir este visitante?')) {
        let visitors = [];
        try {
            const visitorsJSON = localStorage.getItem('visitors');
            if (visitorsJSON) {
                visitors = JSON.parse(visitorsJSON);
            }
        } catch (e) {
            console.error('Erro ao carregar visitantes:', e);
            return;
        }

        visitors = visitors.filter(visitor => visitor.id !== id);
        localStorage.setItem('visitors', JSON.stringify(visitors));

        displayVisitorsList();
    }
}

// Função para gerar PDF
function generatePDF() {
    // Verificar se jsPDF está disponível
    if (!window.jspdf) {
        alert('Biblioteca PDF não carregada. Por favor, atualize a página.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Lista de Visitantes - SCV', 14, 20);

    // Data e hora
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    // Obter dados de visitantes
    let visitors = [];
    try {
        const visitorsJSON = localStorage.getItem('visitors');
        if (visitorsJSON) {
            visitors = JSON.parse(visitorsJSON);
        }
    } catch (e) {
        console.error('Erro ao carregar visitantes:', e);
        doc.text('Erro ao carregar dados de visitantes.', 14, 50);
        doc.save('visitantes.pdf');
        return;
    }

    if (!visitors || visitors.length === 0) {
        doc.text('Nenhum visitante cadastrado.', 14, 50);
        doc.save('visitantes.pdf');
        return;
    }

    // Preparar dados para a tabela
    const tableColumn = ["Nome", "Cidade", "Evangélico", "Igreja", "Data de Cadastro"];
    const tableRows = [];

    visitors.forEach(visitor => {
        const visitorData = [
            visitor.name,
            visitor.city,
            visitor.evangelical,
            visitor.evangelical === 'Sim' ? (visitor.churchName || 'Não informada') : 'N/A',
            visitor.date
        ];
        tableRows.push(visitorData);
    });

    // Adicionar tabela ao PDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [42, 82, 152], textColor: 255 }
    });

    // Salvar PDF
    doc.save('visitantes.pdf');
}

// Função para compartilhar PDF
function sharePDF() {
    // Verificar se jsPDF está disponível
    if (!window.jspdf) {
        alert('Biblioteca PDF não carregada. Por favor, atualize a página.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Lista de Visitantes - SCV', 14, 20);

    // Data e hora
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    // Obter dados de visitantes
    let visitors = [];
    try {
        const visitorsJSON = localStorage.getItem('visitors');
        if (visitorsJSON) {
            visitors = JSON.parse(visitorsJSON);
        }
    } catch (e) {
        console.error('Erro ao carregar visitantes:', e);
        alert('Erro ao carregar dados de visitantes.');
        return;
    }

    if (!visitors || visitors.length === 0) {
        doc.text('Nenhum visitante cadastrado.', 14, 50);
        shareFile(doc);
        return;
    }

    // Preparar dados para a tabela
    const tableColumn = ["Nome", "Cidade", "Evangélico", "Igreja", "Data de Cadastro"];
    const tableRows = [];

    visitors.forEach(visitor => {
        const visitorData = [
            visitor.name,
            visitor.city,
            visitor.evangelical,
            visitor.evangelical === 'Sim' ? (visitor.churchName || 'Não informada') : 'N/A',
            visitor.date
        ];
        tableRows.push(visitorData);
    });

    // Adicionar tabela ao PDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [42, 82, 152], textColor: 255 }
    });

    // Compartilhar o PDF
    shareFile(doc);
}

// Função auxiliar para compartilhar arquivo
function shareFile(doc) {
    // Criar arquivo blob do PDF
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], 'visitantes.pdf', { type: 'application/pdf' });

    // Verificar se a API Web Share está disponível
    if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        navigator.share({
            files: [pdfFile],
            title: 'Lista de Visitantes - SCV',
            text: 'Relatório de visitantes gerado pelo SCV'
        })
            .catch((error) => {
                console.log('Erro ao compartilhar:', error);
                doc.save('visitantes.pdf');
            });
    } else {
        // Fallback: criar link para download se a API Web Share não estiver disponível
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Opções de compartilhamento alternativas
        if (confirm('Deseja enviar este PDF por e-mail?')) {
            const emailSubject = encodeURIComponent('Lista de Visitantes - SCV');
            const emailBody = encodeURIComponent('Segue em anexo a lista de visitantes.');
            window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

            alert('Após enviar o e-mail, não se esqueça de anexar o PDF que será baixado agora.');
        }

        // Fazer download do arquivo
        const tempLink = document.createElement('a');
        tempLink.href = pdfUrl;
        tempLink.download = 'visitantes.pdf';
        tempLink.click();

        // Limpar URL temporária
        URL.revokeObjectURL(pdfUrl);
    }
}

/**
 * Salva os dados de um novo visitante no localStorage
 */
function saveVisitor() {
    const name = document.getElementById('name').value;
    const city = document.getElementById('city').value;
    const evangelical = document.querySelector('input[name="evangelical"]:checked').value;
    const churchName = evangelical === 'Sim' ? document.getElementById('churchName').value : '';

    const visitor = {
        id: Date.now(),
        name,
        city,
        evangelical,
        churchName,
        date: new Date().toLocaleString()
    };

    let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    visitors.push(visitor);
    localStorage.setItem('visitors', JSON.stringify(visitors));

    document.getElementById('visitorForm').reset();
    document.getElementById('churchSection').style.display = 'none';

    displayVisitors();
}

/**
 * Exibe a lista de visitantes cadastrados
 */
function displayVisitors() {
    const displayDiv = document.getElementById('displayVisitors');
    if (!displayDiv) return;

    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];

    if (visitors.length === 0) {
        displayDiv.innerHTML = '<p>Nenhum visitante cadastrado.</p>';
        return;
    }

    let html = '<h2>Visitantes Cadastrados</h2>';
    html += '<div class="visitors-list">';

    visitors.forEach(visitor => {
        html += `
            <div class="visitor-card">
                <div class="visitor-info">
                    <h3>${visitor.name}</h3>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>Evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Igreja:</strong> ${visitor.churchName}</p>` : ''}
                    <p><strong>Data:</strong> ${visitor.date}</p>
                </div>
                <div class="visitor-actions">
                    <button class="btn-edit" onclick="editVisitor(${visitor.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="deleteVisitor(${visitor.id})">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    displayDiv.innerHTML = html;
}