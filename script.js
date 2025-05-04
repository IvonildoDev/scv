document.addEventListener('DOMContentLoaded', function () {
    // Sidebar toggle - Correção para garantir que o menu hambúrguer funcione
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const menuToggle = document.getElementById('menuToggle');

    console.log('Menu toggle element:', menuToggle); // Para debug

    if (menuToggle) {
        menuToggle.addEventListener('click', function (e) {
            e.preventDefault(); // Previne comportamento padrão
            e.stopPropagation(); // Impede propagação do evento

            console.log('Menu toggle clicked'); // Para debug

            sidebar.classList.toggle('active');
            mainContent.classList.toggle('sidebar-active');
        });
    }

    // Fechando sidebar ao clicar fora
    document.addEventListener('click', function (e) {
        if (sidebar && !sidebar.contains(e.target) && e.target !== menuToggle && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mainContent.classList.remove('sidebar-active');
        }
    });

    // Inicialização específica da página de cadastro de visitantes
    if (document.getElementById('visitorForm')) {
        initVisitorPage();
    }

    // Verificar qual página está sendo carregada
    const currentPage = window.location.pathname.split('/').pop();

    // Inicializar a página apropriada
    if (currentPage === 'listavisitantes.html') {
        initListPage();
    }
});

function initVisitorPage() {
    // Carregar visitantes ao iniciar
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

/**
 * Edita um visitante existente
 * @param {number} id - ID do visitante a ser editado
 */
function editVisitor(id) {
    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    const visitor = visitors.find(v => v.id === id);

    if (visitor) {
        document.getElementById('name').value = visitor.name;
        document.getElementById('city').value = visitor.city;

        if (visitor.evangelical === 'Sim') {
            document.getElementById('evangelicalYes').checked = true;
            document.getElementById('churchSection').style.display = 'block';
            document.getElementById('churchName').value = visitor.churchName;
        } else {
            document.getElementById('evangelicalNo').checked = true;
            document.getElementById('churchSection').style.display = 'none';
        }

        deleteVisitor(id, false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Exclui um visitante
 * @param {number} id - ID do visitante a ser excluído
 * @param {boolean} askConfirmation - Define se deve pedir confirmação
 */
function deleteVisitor(id, askConfirmation = true) {
    if (askConfirmation && !confirm('Tem certeza que deseja excluir este visitante?')) {
        return;
    }

    let visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    visitors = visitors.filter(visitor => visitor.id !== id);
    localStorage.setItem('visitors', JSON.stringify(visitors));

    displayVisitors();
}

// Função para inicializar a página de lista de visitantes
function initListPage() {
    // Evento de busca
    document.getElementById('searchButton').addEventListener('click', function () {
        searchVisitors();
    });

    document.getElementById('searchVisitor').addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            searchVisitors();
        }
    });

    // Eventos para os botões de exportação
    document.getElementById('generatePDF').addEventListener('click', function () {
        generatePDF();
    });

    document.getElementById('sharePDF').addEventListener('click', function () {
        sharePDF();
    });

    // Exibe a lista inicial de visitantes
    displayVisitorsList();
}

// Função para exibir a lista de visitantes
function displayVisitorsList() {
    const listContainer = document.getElementById('visitorsList');
    if (!listContainer) return;

    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];

    if (visitors.length === 0) {
        listContainer.innerHTML = '<p class="no-data">Nenhum visitante cadastrado.</p>';
        return;
    }

    let html = '';

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

    listContainer.innerHTML = html;
}

// Função para buscar visitantes
function searchVisitors() {
    const searchTerm = document.getElementById('searchVisitor').value.toLowerCase();
    const listContainer = document.getElementById('visitorsList');
    if (!listContainer) return;

    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];

    if (visitors.length === 0) {
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

    listContainer.innerHTML = html;
}

// Função para gerar PDF
function generatePDF() {
    // Usando a biblioteca jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Lista de Visitantes - SCV', 14, 20);

    // Data e hora
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    // Obter dados de visitantes
    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];

    if (visitors.length === 0) {
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
            visitor.evangelical === 'Sim' ? visitor.churchName : 'N/A',
            visitor.date
        ];
        tableRows.push(visitorData);
    });

    // Adicionar tabela ao PDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [42, 82, 152],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
    });

    // Salvar PDF
    doc.save('visitantes.pdf');
}

// Função para compartilhar PDF
function sharePDF() {
    // Usando a biblioteca jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Lista de Visitantes - SCV', 14, 20);

    // Data e hora
    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);

    // Obter dados de visitantes
    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];

    if (visitors.length === 0) {
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
            visitor.evangelical === 'Sim' ? visitor.churchName : 'N/A',
            visitor.date
        ];
        tableRows.push(visitorData);
    });

    // Adicionar tabela ao PDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [42, 82, 152],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
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
            text: 'Relatório de visitantes gerado pelo Sistema de Cadastro de Visitantes'
        })
            .then(() => console.log('Compartilhamento bem-sucedido'))
            .catch((error) => {
                console.log('Erro ao compartilhar:', error);
                // Fallback: fazer download do PDF se o compartilhamento falhar
                doc.save('visitantes.pdf');
            });
    } else {
        // Fallback: criar link para download se a API Web Share não estiver disponível
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Criar link temporário para download
        const tempLink = document.createElement('a');
        tempLink.href = pdfUrl;
        tempLink.download = 'visitantes.pdf';

        // Exibir opções de compartilhamento por e-mail
        if (confirm('Deseja enviar este PDF por e-mail?')) {
            const emailSubject = encodeURIComponent('Lista de Visitantes - SCV');
            const emailBody = encodeURIComponent('Segue em anexo a lista de visitantes gerada pelo Sistema de Cadastro de Visitantes.');
            window.location.href = `mailto:?subject=${emailSubject}&body=${emailBody}`;

            alert('Após enviar o e-mail, não se esqueça de anexar o PDF que será baixado agora.');
        }

        // Fazer download do arquivo
        tempLink.click();

        // Limpar URL temporária
        URL.revokeObjectURL(pdfUrl);
    }
}