Dev / html - js / csv - 2 / script.js

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const evangelicalRadios = document.querySelectorAll('input[name="evangelical"]');
    const churchSection = document.getElementById('churchSection');
    const visitorForm = document.getElementById('visitorForm');
    const displayVisitorsDiv = document.getElementById('displayVisitors');

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menu.setAttribute('aria-hidden', isExpanded);
        });
    }

    if (evangelicalRadios) {
        evangelicalRadios.forEach(radio => {
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
                    <p>Nome: ${visitor.name}, Cidade: ${visitor.city}, Evangélico: ${visitor.evangelical}, Igreja: ${visitor.churchName}</p>
                `;
            });
        } catch (error) {
            console.error('Erro ao exibir dados:', error);
        }
    }

    // Carregar visitantes ao iniciar a página
    displayVisitors();
});