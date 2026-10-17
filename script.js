/* SCV — Sistema de Cadastro de Visitantes */

// Preencha para exibir os canais na página de Contato (campos vazios ficam ocultos).
const CONTACT = {
    email: 'contato@scv.com.br',
    phone: '',     // ex.: '(92) 3000-0000'
    whatsapp: ''   // ex.: '5592990000000' (somente números, com DDI e DDD)
};

const STORAGE_KEY = 'visitors';

const ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    plus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-10 7L2 7"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
};

const NAV = [
    { href: 'index.html', page: 'home', label: 'Início', icon: 'home' },
    { href: 'cadastrovisitantes.html', page: 'cadastro', label: 'Cadastrar visitante', icon: 'plus' },
    { href: 'listavisitantes.html', page: 'lista', label: 'Visitantes', icon: 'users' },
    { href: 'sobre.html', page: 'sobre', label: 'Sobre', icon: 'info' },
    { href: 'contato.html', page: 'contato', label: 'Contato', icon: 'mail' }
];

/* ---------- Utilidades ---------- */

function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function getVisitors() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveVisitors(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function todayBR() {
    return new Date().toLocaleDateString('pt-BR');
}

// Registros antigos podem ter data + hora; mantém só a data (dd/mm/aaaa).
function dateOnly(value) {
    return String(value || '').split(' ')[0].replace(',', '');
}

function churchOf(v) {
    return v.evangelical === 'Sim' ? (v.churchName || 'Não informada') : '—';
}

function roleOf(v) {
    if (v.evangelical !== 'Sim') return '—';
    if (v.hasRole === 'Sim') return v.roleName || 'Não informado';
    return v.hasRole === 'Não' ? 'Sem cargo' : '—';
}

let toastTimer;
function toast(message) {
    let el = document.getElementById('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        el.className = 'toast';
        el.setAttribute('role', 'status');
        document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function confirmDialog({ title, text, confirmLabel }) {
    return new Promise(resolve => {
        const dlg = document.createElement('dialog');
        dlg.innerHTML = `
            <h3>${esc(title)}</h3>
            <p>${esc(text)}</p>
            <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-r="no">Cancelar</button>
                <button type="button" class="btn btn-danger" data-r="yes">${esc(confirmLabel)}</button>
            </div>`;
        document.body.appendChild(dlg);
        dlg.addEventListener('click', e => {
            const r = e.target.closest('[data-r]');
            if (r) dlg.close(r.dataset.r);
        });
        dlg.addEventListener('close', () => {
            resolve(dlg.returnValue === 'yes');
            dlg.remove();
        });
        dlg.showModal();
    });
}

/* ---------- Estrutura comum (menu lateral e barra superior) ---------- */

function buildShell() {
    const sidebar = document.getElementById('sidebar');
    const current = document.body.dataset.page;
    if (!sidebar) return;

    sidebar.innerHTML = `
        <div class="brand">
            <img src="logo.svg" alt="" width="40" height="40">
            <div>
                <strong>SCV</strong>
                <span>Sistema de cadastro de visitantes</span>
            </div>
        </div>
        <ul class="nav">
            ${NAV.map(n => `
                <li><a href="${n.href}"${n.page === current ? ' aria-current="page"' : ''}>${icon(n.icon)}${n.label}</a></li>
            `).join('')}
        </ul>
        <div class="side-foot">Desenvolvido por Ivonildo Lima</div>`;

    const topbar = document.getElementById('topbar');
    if (topbar) {
        topbar.innerHTML = `
            <button class="icon-btn" id="menuToggle" aria-label="Abrir menu" aria-controls="sidebar">${icon('menu')}</button>
            <span>${esc(document.body.dataset.title || 'SCV')}</span>`;
    }

    const overlay = document.getElementById('overlay');
    const setOpen = open => {
        sidebar.classList.toggle('open', open);
        overlay.classList.toggle('open', open);
    };
    document.getElementById('menuToggle')?.addEventListener('click', () => setOpen(!sidebar.classList.contains('open')));
    overlay?.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

    document.querySelectorAll('[data-icon]').forEach(el => {
        el.innerHTML = icon(el.dataset.icon);
        el.style.display = 'inline-flex';
    });
}

/* ---------- Início ---------- */

function initHome() {
    const visitors = getVisitors();
    const now = new Date();
    const thisMonth = visitors.filter(v => {
        const [, m, y] = dateOnly(v.date).split('/');
        return Number(m) === now.getMonth() + 1 && Number(y) === now.getFullYear();
    }).length;
    const evangelicals = visitors.filter(v => v.evangelical === 'Sim').length;

    document.getElementById('statTotal').textContent = visitors.length;
    document.getElementById('statMonth').textContent = thisMonth;
    document.getElementById('statEvangelical').textContent = evangelicals;

    const box = document.getElementById('recent');
    if (!visitors.length) {
        box.innerHTML = `<div class="empty">Nenhum visitante cadastrado ainda.<br><a href="cadastrovisitantes.html">Cadastrar o primeiro</a></div>`;
        return;
    }
    const recent = [...visitors].reverse().slice(0, 5);
    box.innerHTML = `<table>
        <thead><tr><th>Nome</th><th>Cidade</th><th>Data</th></tr></thead>
        <tbody>${recent.map(v => `
            <tr>
                <td class="cell-name"><span class="name">${esc(v.name)}</span></td>
                <td data-label="Cidade">${esc(v.city)}</td>
                <td data-label="Data">${esc(dateOnly(v.date))}</td>
            </tr>`).join('')}
        </tbody></table>`;
}

/* ---------- Cadastro / edição ---------- */

function initForm() {
    const form = document.getElementById('visitorForm');
    const churchField = document.getElementById('churchSection');
    const churchInput = document.getElementById('churchName');
    const editId = Number(new URLSearchParams(location.search).get('edit')) || null;

    const roleChoice = document.getElementById('roleChoice');
    const toggleChurch = show => {
        churchField.hidden = !show;
        churchInput.required = show;
        if (!show) churchInput.value = '';
        // A pergunta sobre cargo só faz sentido para evangélicos.
        roleChoice.hidden = !show;
        document.getElementById('roleYes').required = show;
        if (!show) {
            roleChoice.querySelectorAll('input').forEach(i => { i.checked = false; });
            toggleRole(false);
        }
    };
    document.getElementById('evangelicalYes').addEventListener('change', () => toggleChurch(true));
    document.getElementById('evangelicalNo').addEventListener('change', () => toggleChurch(false));

    const roleField = document.getElementById('roleSection');
    const roleInput = document.getElementById('roleName');
    const toggleRole = show => {
        roleField.hidden = !show;
        roleInput.required = show;
        if (!show) roleInput.value = '';
    };
    document.getElementById('roleYes').addEventListener('change', () => toggleRole(true));
    document.getElementById('roleNo').addEventListener('change', () => toggleRole(false));

    if (editId) {
        const visitor = getVisitors().find(v => v.id === editId);
        if (!visitor) {
            toast('Visitante não encontrado.');
        } else {
            document.getElementById('formTitle').textContent = 'Editar visitante';
            document.getElementById('formLead').textContent = 'Altere os dados e salve.';
            document.getElementById('submitLabel').textContent = 'Salvar alterações';
            document.getElementById('name').value = visitor.name;
            document.getElementById('city').value = visitor.city;
            const isEvangelical = visitor.evangelical === 'Sim';
            document.getElementById(isEvangelical ? 'evangelicalYes' : 'evangelicalNo').checked = true;
            toggleChurch(isEvangelical);
            churchInput.value = visitor.churchName || '';
            if (visitor.hasRole) {
                const hasRole = visitor.hasRole === 'Sim';
                document.getElementById(hasRole ? 'roleYes' : 'roleNo').checked = true;
                toggleRole(hasRole);
                roleInput.value = visitor.roleName || '';
            }
        }
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const isEvangelical = form.evangelical.value === 'Sim';
        const data = {
            name: form.elements.name.value.trim(),
            city: form.city.value.trim(),
            evangelical: form.evangelical.value,
            churchName: form.evangelical.value === 'Sim' ? churchInput.value.trim() : '',
            hasRole: isEvangelical ? form.hasRole.value : '',
            roleName: isEvangelical && form.hasRole.value === 'Sim' ? roleInput.value.trim() : ''
        };
        const visitors = getVisitors();

        if (editId) {
            const i = visitors.findIndex(v => v.id === editId);
            if (i === -1) return toast('Visitante não encontrado.');
            visitors[i] = { ...visitors[i], ...data };
            saveVisitors(visitors);
            sessionStorage.setItem('flash', 'Alterações salvas.');
            location.href = 'listavisitantes.html';
            return;
        }

        visitors.push({ id: Date.now(), ...data, date: todayBR() });
        saveVisitors(visitors);
        form.reset();
        toggleChurch(false);
        toggleRole(false);
        form.elements.name.focus();
        toast(`${data.name} foi cadastrado.`);
    });
}

function initials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
}

// Tom do avatar escolhido pelo nome, para o mesmo visitante manter sempre a mesma cor.
function avatarTone(name) {
    let h = 0;
    for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) % 5;
    return `tone-${h}`;
}

function visitorCard(v) {
    const evangelical = v.evangelical === 'Sim';
    const details = [];
    if (evangelical) {
        details.push(['Igreja', churchOf(v)]);
        if (v.hasRole) details.push(['Cargo', roleOf(v)]);
    }
    details.push(['Cadastro', dateOnly(v.date)]);

    return `
        <article class="vcard">
            <header class="vcard-top">
                <span class="avatar ${avatarTone(v.name)}" aria-hidden="true">${esc(initials(v.name))}</span>
                <div class="vcard-id">
                    <h3>${esc(v.name)}</h3>
                    <p class="where">${icon('pin')}${esc(v.city)}</p>
                </div>
                <div class="row-actions">
                    <a class="icon-btn" href="cadastrovisitantes.html?edit=${v.id}" aria-label="Editar ${esc(v.name)}" title="Editar">${icon('edit')}</a>
                    <button class="icon-btn del" data-del="${v.id}" aria-label="Excluir ${esc(v.name)}" title="Excluir">${icon('trash')}</button>
                </div>
            </header>
            <span class="tag${evangelical ? '' : ' no'}">${evangelical ? 'Evangélico' : 'Não evangélico'}</span>
            <dl class="vcard-meta">
                ${details.map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join('')}
            </dl>
        </article>`;
}

/* ---------- Lista ---------- */

function initList() {
    const body = document.getElementById('rows');
    const search = document.getElementById('searchVisitor');
    const count = document.getElementById('count');
    const tableWrap = body;
    const empty = document.getElementById('emptyState');

    const flash = sessionStorage.getItem('flash');
    if (flash) {
        sessionStorage.removeItem('flash');
        toast(flash);
    }

    function render() {
        const all = getVisitors();
        const term = search.value.trim().toLowerCase();
        const list = [...all].reverse().filter(v =>
            !term || `${v.name} ${v.city} ${v.churchName || ''} ${v.roleName || ''}`.toLowerCase().includes(term)
        );

        count.textContent = term
            ? `${list.length} de ${all.length} visitantes`
            : `${all.length} ${all.length === 1 ? 'visitante' : 'visitantes'}`;

        tableWrap.hidden = list.length === 0;
        empty.hidden = list.length > 0;
        empty.innerHTML = all.length
            ? 'Nenhum visitante encontrado para essa busca.'
            : 'Nenhum visitante cadastrado ainda.<br><a href="cadastrovisitantes.html">Cadastrar o primeiro</a>';

        body.innerHTML = list.map(visitorCard).join('');
    }

    search.addEventListener('input', render);

    body.addEventListener('click', async e => {
        const btn = e.target.closest('[data-del]');
        if (!btn) return;
        const id = Number(btn.dataset.del);
        const visitor = getVisitors().find(v => v.id === id);
        const ok = await confirmDialog({
            title: 'Excluir visitante',
            text: `${visitor ? visitor.name : 'Este visitante'} será removido da lista. Essa ação não pode ser desfeita.`,
            confirmLabel: 'Excluir'
        });
        if (!ok) return;
        saveVisitors(getVisitors().filter(v => v.id !== id));
        render();
        toast('Visitante excluído.');
    });

    document.getElementById('clearAll').addEventListener('click', async () => {
        if (!getVisitors().length) return toast('A lista já está vazia.');
        const ok = await confirmDialog({
            title: 'Apagar todos os visitantes',
            text: 'Todo o histórico será apagado deste aparelho. Essa ação não pode ser desfeita.',
            confirmLabel: 'Apagar tudo'
        });
        if (!ok) return;
        saveVisitors([]);
        render();
        toast('Histórico apagado.');
    });

    document.getElementById('generatePDF').addEventListener('click', () => {
        const doc = buildPDF();
        if (doc) doc.save('visitantes.pdf');
    });
    document.getElementById('sharePDF').addEventListener('click', sharePDF);

    render();
}

/* ---------- PDF ---------- */

function buildPDF() {
    if (!window.jspdf) {
        toast('Biblioteca de PDF não carregada. Verifique a conexão e recarregue.');
        return null;
    }
    const visitors = getVisitors();
    if (!visitors.length) {
        toast('Não há visitantes para exportar.');
        return null;
    }
    const doc = new window.jspdf.jsPDF();
    doc.setFontSize(18);
    doc.text('Lista de Visitantes', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em ${todayBR()} · ${visitors.length} registros`, 14, 28);

    doc.autoTable({
        head: [['Nome', 'Cidade', 'Evangélico', 'Igreja', 'Cargo', 'Cadastro']],
        body: visitors.map(v => [v.name, v.city, v.evangelical, churchOf(v), roleOf(v), dateOnly(v.date)]),
        startY: 36,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [31, 58, 95], textColor: 255 }
    });
    return doc;
}

async function sharePDF() {
    const doc = buildPDF();
    if (!doc) return;
    const file = new File([doc.output('blob')], 'visitantes.pdf', { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: 'Lista de Visitantes' });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }
    doc.save('visitantes.pdf');
    toast('Compartilhamento indisponível neste aparelho. O PDF foi baixado.');
}

/* ---------- Contato ---------- */

function initContact() {
    const channels = [
        CONTACT.email && { href: `mailto:${CONTACT.email}`, icon: 'mail', title: 'E-mail', text: CONTACT.email },
        CONTACT.phone && { href: `tel:${CONTACT.phone.replace(/\D/g, '')}`, icon: 'phone', title: 'Telefone', text: CONTACT.phone },
        CONTACT.whatsapp && { href: `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`, icon: 'chat', title: 'WhatsApp', text: 'Enviar mensagem' }
    ].filter(Boolean);

    document.getElementById('channels').innerHTML = channels.map(c => `
        <a class="channel" href="${esc(c.href)}">${icon(c.icon)}<div><b>${c.title}</b><span>${esc(c.text)}</span></div></a>
    `).join('');

    const form = document.getElementById('contactForm');
    if (!CONTACT.email) {
        form.closest('.panel').hidden = true;
        return;
    }
    // Abre o app de e-mail do usuário já preenchido; o sistema não tem servidor próprio.
    form.addEventListener('submit', e => {
        e.preventDefault();
        const subject = encodeURIComponent(form.subject.value.trim());
        const body = encodeURIComponent(`${form.message.value.trim()}\n\n— ${form.elements.name.value.trim()} (${form.email.value.trim()})`);
        location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    });
}

/* ---------- Inicialização ---------- */

document.addEventListener('DOMContentLoaded', () => {
    buildShell();
    const init = { home: initHome, cadastro: initForm, lista: initList, contato: initContact }[document.body.dataset.page];
    if (init) init();
});
