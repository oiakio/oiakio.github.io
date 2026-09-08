// ============================================
// PEDIDOS
// ============================================

async function renderRequests() {
    const user = await fetchCurrentUser();
    if (!user) return;

    const app = document.getElementById('app');
    const { data } = await fetchRequests(user.id);

    app.innerHTML = `
        <div class="page requests-page">
            <h2>Pedidos</h2>
            <form id="request-form" class="request-form">
                <div class="form-group">
                    <label for="req-title">Título do conteúdo</label>
                    <input type="text" id="req-title" required>
                </div>
                <div class="form-group">
                    <label for="req-type">Tipo</label>
                    <select id="req-type">
                        <option value="movie">Filme</option>
                        <option value="tv">Série</option>
                        <option value="anime">Anime</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="req-desc">Descrição</label>
                    <textarea id="req-desc" rows="3"></textarea>
                </div>
                <button type="submit" class="btn-primary">Enviar Pedido</button>
            </form>
            <div class="requests-list">
                <h3>Meus pedidos</h3>
                ${(data || []).map(r => `
                    <div class="request-item status-${r.status}">
                        <div>
                            <h4>${r.title}</h4>
                            <span>${r.content_type}</span>
                        </div>
                        <span class="status-badge">${r.status}</span>
                    </div>
                `).join('') || '<p>Nenhum pedido ainda.</p>'}
            </div>
        </div>
    `;

    document.getElementById('request-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('req-title').value;
        const type = document.getElementById('req-type').value;
        const description = document.getElementById('req-desc').value;

        const { error } = await createRequest({
            user_id: user.id,
            title,
            type,
            description,
            status: 'pending',
            created_at: new Date().toISOString(),
        });

        if (error) {
            showToast(error.message, 'error');
            return;
        }

        showToast('Pedido enviado!', 'success');
        renderRequests();
    });
}
