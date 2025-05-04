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

    // Verificar se estamos no modo de edição
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        console.log('Modo de edição detectado para ID:', editId);
        loadVisitorForEditing(parseInt(editId));
    }

    // Event listener para o formulário
    document.getElementById('visitorForm').addEventListener('submit', function (event) {
        event.preventDefault();
        if (editId) {
            // Se estiver editando, atualize o visitante
            updateVisitor(parseInt(editId));
        } else {
            // Se for novo cadastro, salve como novo
            saveVisitor();
        }
    });

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

    // Exibe a lista de visitantes
    displayVisitors();
}

// Função para carregar os dados do visitante para edição
function loadVisitorForEditing(id) {
    try {
        console.log('Carregando visitante para edição...');
        const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
        const visitor = visitors.find(v => v.id === id);

        if (!visitor) {
            console.error('Visitante não encontrado com ID:', id);
            alert('Visitante não encontrado.');
            return;
        }

        console.log('Visitante encontrado:', visitor);

        // Preencher o formulário com os dados do visitante
        document.getElementById('name').value = visitor.name;
        document.getElementById('city').value = visitor.city;

        // Selecionar o radio button correto
        if (visitor.evangelical === 'Sim') {
            document.getElementById('evangelicalYes').checked = true;
            document.getElementById('churchSection').style.display = 'block';
            document.getElementById('churchName').value = visitor.churchName || '';
        } else {
            document.getElementById('evangelicalNo').checked = true;
            document.getElementById('churchSection').style.display = 'none';
        }

        // Alterar o texto do botão para "Atualizar"
        const submitButton = document.querySelector('#visitorForm button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Atualizar Visitante';
        }

        // Adicionar uma classe para indicar que o formulário está em modo de edição
        document.getElementById('visitorForm').classList.add('editing');

        // Adicionar um título de edição
        const formTitle = document.querySelector('.form-container h2');
        if (formTitle) {
            formTitle.textContent = 'Editar Visitante';
        }
    } catch (error) {
        console.error('Erro ao carregar visitante para edição:', error);
        alert('Erro ao carregar dados do visitante.');
    }
}

// Função para atualizar um visitante existente
function updateVisitor(id) {
    try {
        console.log('Atualizando visitante com ID:', id);
        const name = document.getElementById('name').value;
        const city = document.getElementById('city').value;
        const evangelical = document.querySelector('input[name="evangelical"]:checked').value;
        const churchName = evangelical === 'Sim' ? document.getElementById('churchName').value : '';

        let visitors = JSON.parse(localStorage.getItem('visitors')) || [];

        // Encontrar o índice do visitante
        const index = visitors.findIndex(v => v.id === id);

        if (index === -1) {
            console.error('Visitante não encontrado para atualização');
            alert('Erro ao atualizar: Visitante não encontrado.');
            return;
        }

        // Manter a data original ou atualizar para a data atual
        const originalDate = visitors[index].date;

        // Atualizar os dados do visitante
        visitors[index] = {
            ...visitors[index],
            name,
            city,
            evangelical,
            churchName,
            date: originalDate, // Manter a data original
        };

        // Salvar a lista atualizada
        localStorage.setItem('visitors', JSON.stringify(visitors));

        alert('Visitante atualizado com sucesso!');

        // Resetar o formulário e voltar ao modo de cadastro
        document.getElementById('visitorForm').reset();
        document.getElementById('churchSection').style.display = 'none';

        // Restaurar o texto do botão
        const submitButton = document.querySelector('#visitorForm button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Cadastrar Visitante';
        }

        // Remover a classe de edição
        document.getElementById('visitorForm').classList.remove('editing');

        // Restaurar o título
        const formTitle = document.querySelector('.form-container h2');
        if (formTitle) {
            formTitle.textContent = 'Cadastro de Visitante';
        }

        // Atualizar a lista de visitantes
        displayVisitors();

        // Limpar o parâmetro de URL (opcional)
        history.replaceState(null, '', 'cadastrovisitantes.html');
    } catch (error) {
        console.error('Erro ao atualizar visitante:', error);
        alert('Ocorreu um erro ao atualizar o visitante.');
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
        // Extrair apenas a data (se a string contiver hora)
        let cadastroData = visitor.date;
        if (cadastroData && cadastroData.includes(' ')) {
            cadastroData = cadastroData.split(' ')[0];
        }

        html += `
            <div class="visitor-card">
                <div class="visitor-info">
                    <h3>${visitor.name}</h3>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>Evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Igreja:</strong> ${visitor.churchName || 'Não informada'}</p>` : ''}
                    <p><strong>Data:</strong> ${cadastroData}</p>
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

// Funções para gerenciamento de visitantes
function searchVisitors() {
    console.log('Buscando visitantes...');
    const searchTerm = document.getElementById('searchVisitor').value.toLowerCase();
    const listContainer = document.getElementById('visitorsList');
    if (!listContainer) return;

    let visitors = [];
    try {
        const visitorsData = localStorage.getItem('visitors');
        if (visitorsData) {
            visitors = JSON.parse(visitorsData);
        }
    } catch (error) {
        console.error('Erro ao buscar visitantes:', error);
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
        // Extrair apenas a data (se a string contiver hora)
        let cadastroData = visitor.date;
        if (cadastroData && cadastroData.includes(' ')) {
            cadastroData = cadastroData.split(' ')[0];
        }

        html += `
            <div class="visitor-card">
                <div class="visitor-info">
                    <h3>${visitor.name}</h3>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>Evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Igreja:</strong> ${visitor.churchName || 'Não informada'}</p>` : ''}
                    <p><strong>Data:</strong> ${cadastroData}</p>
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

// Função para editar visitante - garante que é acessível globalmente
window.editVisitor = function (id) {
    console.log('Função editVisitor chamada com ID:', id);
    // Redireciona para a página de cadastro com o parâmetro de edição
    window.location.href = `cadastrovisitantes.html?edit=${id}`;
};

// Função para excluir visitante
function deleteVisitor(id) {
    if (confirm('Tem certeza que deseja excluir este visitante?')) {
        let visitors = [];
        try {
            const visitorsData = localStorage.getItem('visitors');
            if (visitorsData) {
                visitors = JSON.parse(visitorsData);
            }
        } catch (error) {
            console.error('Erro ao excluir visitante:', error);
            return;
        }

        visitors = visitors.filter(visitor => visitor.id !== id);
        localStorage.setItem('visitors', JSON.stringify(visitors));

        // Atualizar a lista na interface
        const listContainer = document.getElementById('visitorsList');
        if (listContainer) {
            displayVisitorsList();
        }
    }
}

// Função para gerar PDF
function generatePDF() {
    console.log('Gerando PDF...');
    if (typeof window.jspdf === 'undefined') {
        console.error('Biblioteca jsPDF não encontrada');
        alert('Biblioteca PDF não carregada. Por favor, atualize a página.');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text('Lista de Visitantes - SCV', 14, 20);

        // Data e hora (somente a data atual para o relatório)
        const dataAtual = new Date();
        const dataFormatada = `${dataAtual.getDate().toString().padStart(2, '0')}/${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}/${dataAtual.getFullYear()}`;
        doc.setFontSize(12);
        doc.text(`Gerado em: ${dataFormatada}`, 14, 30);

        // Obter dados de visitantes
        let visitors = [];
        try {
            const visitorsData = localStorage.getItem('visitors');
            console.log('Dados do localStorage:', visitorsData);
            if (visitorsData) {
                visitors = JSON.parse(visitorsData);
                console.log('Visitantes para PDF:', visitors.length);
            }
        } catch (error) {
            console.error('Erro ao acessar localStorage para PDF:', error);
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
            // Extrair apenas a data (se a string contiver hora)
            let cadastroData = visitor.date;
            if (cadastroData && cadastroData.includes(' ')) {
                cadastroData = cadastroData.split(' ')[0];
            }

            const visitorData = [
                visitor.name,
                visitor.city,
                visitor.evangelical,
                visitor.evangelical === 'Sim' ? (visitor.churchName || 'Não informada') : 'N/A',
                cadastroData
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
        console.log('PDF gerado com sucesso');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    }
}

// Função para compartilhar PDF
function sharePDF() {
    console.log('Compartilhando PDF...');
    if (typeof window.jspdf === 'undefined') {
        console.error('Biblioteca jsPDF não encontrada');
        alert('Biblioteca PDF não carregada. Por favor, atualize a página.');
        return;
    }

    try {
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
            const visitorsData = localStorage.getItem('visitors');
            if (visitorsData) {
                visitors = JSON.parse(visitorsData);
            }
        } catch (error) {
            console.error('Erro ao acessar localStorage para compartilhamento:', error);
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
    } catch (error) {
        console.error('Erro ao compartilhar PDF:', error);
        alert('Ocorreu um erro ao compartilhar o PDF. Por favor, tente novamente.');
    }
}

// Função auxiliar para compartilhar arquivo
function shareFile(doc) {
    try {
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
    } catch (error) {
        console.error('Erro ao compartilhar arquivo:', error);
        alert('Ocorreu um erro ao compartilhar o arquivo. O PDF será baixado automaticamente.');
        doc.save('visitantes.pdf');
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

    // Formatar a data para mostrar apenas a data (sem a hora)
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;

    const visitor = {
        id: Date.now(),
        name,
        city,
        evangelical,
        churchName,
        date: formattedDate // Usar o formato de data sem hora
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
        // Extrair apenas a data (se a string contiver hora)
        let cadastroData = visitor.date;
        if (cadastroData && cadastroData.includes(' ')) {
            cadastroData = cadastroData.split(' ')[0];
        }

        html += `
            <div class="visitor-card">
                <div class="visitor-info">
                    <h3>${visitor.name}</h3>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>Evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Igreja:</strong> ${visitor.churchName}</p>` : ''}
                    <p><strong>Data:</strong> ${cadastroData}</p>
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