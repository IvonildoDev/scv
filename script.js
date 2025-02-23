// Adicionar evento quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const evangelicalRadios = document.querySelectorAll('input[name="evangelical"]');
    const churchSection = document.getElementById('churchSection');
    const visitorForm = document.getElementById('visitorForm');
    const displayVisitorsDiv = document.getElementById('displayVisitors');
    const generatePDFButton = document.getElementById('generatePDF');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menu.setAttribute('aria-hidden', isExpanded);
            menu.classList.toggle('show');
        });
    }

    if (evangelicalRadios) {
        evangelicalRadios.forEach(radio => {
            const label = radio.parentElement;
            if (label) {
                label.classList.add('checkbox-label');
            }
            radio.addEventListener('change', function () {
                if (this.value === 'Sim') {
                    churchSection.style.display = 'block';
                } else {
                    churchSection.style.display = 'none';
                }
            });
        });
    }

    if (visitorForm) {
        visitorForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(visitorForm);
            const visitor = {
                name: formData.get('name'),
                city: formData.get('city'),
                evangelical: formData.get('evangelical'),
                churchName: formData.get('churchName')
            };
            saveVisitor(visitor);
            displayVisitor(visitor);
            visitorForm.reset();
            churchSection.style.display = 'none';
        });
    }

    function saveVisitor(visitor) {
        const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
        visitors.push(visitor);
        localStorage.setItem('visitors', JSON.stringify(visitors));
    }

    function displayVisitor(visitor) {
        const visitorDiv = document.createElement('div');
        visitorDiv.classList.add('visitor');
        visitorDiv.innerHTML = `
            <p><strong>Nome:</strong> ${visitor.name}</p>
            <p><strong>Cidade:</strong> ${visitor.city}</p>
            <p><strong>É evangélico:</strong> ${visitor.evangelical}</p>
            ${visitor.evangelical === 'Sim' ? `<p><strong>Nome da Igreja:</strong> ${visitor.churchName}</p>` : ''}
        `;
        displayVisitorsDiv.appendChild(visitorDiv);
    }

    function displayVisitors() {
        const displayDiv = document.getElementById('displayVisitors');
        if (!displayDiv) return;

        try {
            const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
            displayDiv.innerHTML = '';

            if (visitors.length === 0) {
                displayDiv.innerHTML = '<p>Nenhum visitante cadastrado.</p>';
                return;
            }

            visitors.forEach(visitor => {
                displayDiv.innerHTML += `
                    <div class="visitor">
                        <p><strong>Nome:</strong> ${visitor.name}</p>
                        <p><strong>Cidade:</strong> ${visitor.city}</p>
                        <p><strong>É evangélico:</strong> ${visitor.evangelical}</p>
                        ${visitor.evangelical === 'Sim' ? `<p><strong>Nome da Igreja:</strong> ${visitor.churchName}</p>` : ''}
                    </div>
                `;
            });
        } catch (error) {
            console.error('Erro ao exibir dados:', error);
        }
    }

    // Carregar visitantes ao iniciar a página
    displayVisitors();

    // Gerar PDF
    if (generatePDFButton) {
        generatePDFButton.addEventListener('click', function () {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
            if (visitors.length === 0) {
                alert('Nenhum visitante cadastrado para gerar PDF.');
                return;
            }

            doc.setFontSize(18);
            doc.text('Lista de Visitantes', 105, 10, null, null, 'center');
            doc.setFontSize(12);

            let y = 20;
            visitors.forEach(visitor => {
                doc.setFontSize(14);
                doc.text(`Nome: ${visitor.name}`, 10, y);
                y += 10;
                doc.setFontSize(12);
                doc.text(`Cidade: ${visitor.city}`, 10, y);
                y += 10;
                doc.text(`É evangélico: ${visitor.evangelical}`, 10, y);
                y += 10;
                if (visitor.evangelical === 'Sim') {
                    doc.text(`Nome da Igreja: ${visitor.churchName}`, 10, y);
                    y += 10;
                }
                y += 10; // Add extra space between visitors
            });

            doc.save('lista_de_visitantes.pdf');
        });
    }

    // Limpar histórico
    document.getElementById('clearHistory').addEventListener('click', () => {
        localStorage.removeItem('visitors');
        document.getElementById('displayVisitors').innerHTML = '';
    });
});