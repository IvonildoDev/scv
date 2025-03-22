function toggleMenu() {
    const menu = document.getElementById("menu");
    const menuToggle = document.querySelector('.menu-toggle');
    menu.classList.toggle("show");
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
}

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const evangelicalRadios = document.querySelectorAll('input[name="evangelical"]');
    const churchSection = document.getElementById('churchSection');
    const visitorForm = document.getElementById('visitorForm');
    const displayVisitorsDiv = document.getElementById('displayVisitors');
    const generatePDFButton = document.getElementById('generatePDF');
    const clearHistoryButton = document.getElementById('clearHistory');

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    if (evangelicalRadios) {
        evangelicalRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                churchSection.style.display = this.value === 'Sim' ? 'block' : 'none';
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
        visitorDiv.style.opacity = '0';
        visitorDiv.innerHTML = `
            <p><strong>Nome:</strong> ${visitor.name}</p>
            <p><strong>Cidade:</strong> ${visitor.city}</p>
            <p><strong>É evangélico:</strong> ${visitor.evangelical}</p>
            ${visitor.evangelical === 'Sim' ? `<p><strong>Nome da Igreja:</strong> ${visitor.churchName}</p>` : ''}
        `;
        displayVisitorsDiv.appendChild(visitorDiv);
        setTimeout(() => visitorDiv.style.opacity = '1', 10);
    }

    function displayVisitors() {
        if (!displayVisitorsDiv) return;
        const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
        displayVisitorsDiv.innerHTML = visitors.length === 0
            ? '<p>Nenhum visitante cadastrado.</p>'
            : visitors.map(visitor => `
                <div class="visitor">
                    <p><strong>Nome:</strong> ${visitor.name}</p>
                    <p><strong>Cidade:</strong> ${visitor.city}</p>
                    <p><strong>É evangélico:</strong> ${visitor.evangelical}</p>
                    ${visitor.evangelical === 'Sim' ? `<p><strong>Nome da Igreja:</strong> ${visitor.churchName}</p>` : ''}
                </div>
            `).join('');
    }

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
                y += 10;
            });
            doc.save('lista_de_visitantes.pdf');
        });
    }

    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', () => {
            // Mostrar modal personalizado em vez do confirm padrão do navegador
            const modal = document.getElementById('confirmationModal');
            modal.style.display = 'flex';

            // Manipular botão de fechar
            const closeButton = document.querySelector('.close-modal');
            closeButton.onclick = function () {
                modal.style.display = 'none';
            }

            // Manipular botão de cancelar
            const cancelButton = document.getElementById('cancelDelete');
            cancelButton.onclick = function () {
                modal.style.display = 'none';
            }

            // Manipular botão de confirmar
            const confirmButton = document.getElementById('confirmDelete');
            confirmButton.onclick = function () {
                localStorage.removeItem('visitors');
                displayVisitors();
                modal.style.display = 'none';
            }

            // Fechar o modal ao clicar fora dele
            window.onclick = function (event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            }
        });
    }

    displayVisitors();
});