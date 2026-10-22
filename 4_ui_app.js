// ==========================================
// LÓGICA DA INTERFACE (UI E EVENTOS)
// ==========================================

let contactsList = [];
let stream = null;

// Elementos
const listEl = document.getElementById('contactList');
const emptyEl = document.getElementById('emptyState');
const loadEl = document.getElementById('loadingIndicator');

// Iniciar a aplicação
document.addEventListener('DOMContentLoaded', refreshList);
document.getElementById('searchInput').addEventListener('input', (e) => renderList(e.target.value));

// === FUNÇÕES DA LISTA ===

async function refreshList() {
    loadEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    emptyEl.classList.add('hidden');

    contactsList = await dbGetContacts();
    
    loadEl.classList.add('hidden');
    renderList();
}

function renderList(filter = '') {
    listEl.innerHTML = '';
    const filtered = contactsList.filter(c => 
        c.name.toLowerCase().includes(filter.toLowerCase()) || 
        (c.company && c.company.toLowerCase().includes(filter.toLowerCase()))
    );

    if (filtered.length === 0) {
        listEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        return;
    }

    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');

    filtered.forEach(contact => {
        const li = document.createElement('li');
        li.className = 'p-4 hover:bg-slate-50 border-b border-slate-100 flex justify-between items-center group';
        li.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    ${contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 class="font-semibold text-slate-800">${contact.name}</h3>
                    <p class="text-sm text-slate-500">${contact.company || 'Sem empresa'}</p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="hidden md:block text-right">
                    <p class="text-sm text-slate-600">${contact.phone || '--'}</p>
                    <p class="text-sm text-slate-500">${contact.email || '--'}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="editItem('${contact.id}')" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">Editar</button>
                    <button onclick="deleteItem('${contact.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">Apagar</button>
                </div>
            </div>
        `;
        listEl.appendChild(li);
    });
}

// === FORMULÁRIO E MODAL ===

document.getElementById('btnNewContact').addEventListener('click', () => openModal());
document.getElementById('btnCloseModal').addEventListener('click', closeModal);
document.getElementById('btnCancel').addEventListener('click', closeModal);

document.getElementById('btnSave').addEventListener('click', async () => {
    const id = document.getElementById('contactId').value;
    const data = {
        name: document.getElementById('name').value,
        company: document.getElementById('company').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value
    };

    if (!data.name) return alert('O nome é obrigatório!');
    
    document.getElementById('btnSave').innerText = 'A guardar...';
    try {
        if (id) await dbUpdateContact(id, data);
        else await dbInsertContact(data);
        await refreshList();
        closeModal();
    } catch (e) {
        alert('Erro ao guardar (verifique as chaves Supabase)');
    }
    document.getElementById('btnSave').innerText = 'Guardar Contacto';
});

async function deleteItem(id) {
    if (confirm('Apagar este contacto?')) {
        await dbDeleteContact(id);
        await refreshList();
    }
}

function editItem(id) {
    const c = contactsList.find(x => x.id === id);
    if(c) openModal(c);
}

const modal = document.getElementById('contactModal');
function openModal(c = null) {
    document.getElementById('contactForm').reset();
    document.getElementById('contactId').value = c ? c.id : '';
    document.getElementById('name').value = c ? c.name : '';
    document.getElementById('company').value = c && c.company ? c.company : '';
    document.getElementById('phone').value = c && c.phone ? c.phone : '';
    document.getElementById('email').value = c && c.email ? c.email : '';
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('modal-active'), 10);
}
function closeModal() {
    modal.classList.remove('modal-active');
    setTimeout(() => modal.classList.add('hidden'), 300);
    turnOffCam();
}

// === GESTÃO DA CÂMARA ===
document.getElementById('btnOpenCamera').addEventListener('click', async () => {
    const video = document.getElementById('videoElement');
    document.getElementById('cameraContainer').classList.remove('hidden');
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
});
document.getElementById('btnCloseCamera').addEventListener('click', turnOffCam);

function turnOffCam() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    document.getElementById('cameraContainer').classList.add('hidden');
}

document.getElementById('btnCapture').addEventListener('click', async () => {
    const video = document.getElementById('videoElement');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    turnOffCam();
    triggerAI(canvas.toDataURL('image/jpeg'));
});

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => triggerAI(ev.target.result);
        reader.readAsDataURL(e.target.files[0]);
    }
});

async function triggerAI(base64) {
    const statusEl = document.getElementById('aiStatus');
    statusEl.classList.remove('hidden');
    try {
        const parsed = await extractDataFromImage(base64);
        if(parsed) {
            if(parsed.name) document.getElementById('name').value = parsed.name;
            if(parsed.company) document.getElementById('company').value = parsed.company;
            if(parsed.phone) document.getElementById('phone').value = parsed.phone;
            if(parsed.email) document.getElementById('email').value = parsed.email;
        }
    } catch(e) {
        alert("Erro na leitura inteligente.");
    }
    statusEl.classList.add('hidden');
}
