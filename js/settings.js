// ============================================
// CONFIGURAÇÕES
// ============================================

async function renderSettings() {
    const user = await fetchCurrentUser();
    if (!user) return;

    const app = document.getElementById('app');
    const { data: profile } = await fetchProfile(user.id);

    app.innerHTML = `
        <div class="page settings-page">
            <h2>Configurações</h2>
            <form id="settings-form" class="settings-form">
                <div class="form-group">
                    <label for="settings-name">Nome</label>
                    <input type="text" id="settings-name" value="${profile?.name || ''}">
                </div>
                <div class="form-group">
                    <label for="settings-location">Localização</label>
                    <input type="text" id="settings-location" value="${profile?.location || ''}">
                </div>
                <div class="form-group">
                    <label for="settings-avatar">URL do Avatar</label>
                    <input type="url" id="settings-avatar" value="${profile?.avatar_url || ''}">
                </div>
                <div id="settings-error" class="login-error" style="display:none"></div>
                <button type="submit" class="btn-primary">Salvar Perfil</button>
            </form>

            <h3>Alterar Senha</h3>
            <form id="password-form" class="settings-form">
                <div class="form-group">
                    <label for="current-password">Senha atual</label>
                    <input type="password" id="current-password" required>
                </div>
                <div class="form-group">
                    <label for="new-password">Nova senha</label>
                    <input type="password" id="new-password" required>
                </div>
                <div id="password-error" class="login-error" style="display:none"></div>
                <button type="submit" class="btn-primary">Alterar Senha</button>
            </form>

            <h3>Alterar Email</h3>
            <form id="email-form" class="settings-form">
                <div class="form-group">
                    <label for="new-email">Novo email</label>
                    <input type="email" id="new-email" required>
                </div>
                <div id="email-error" class="login-error" style="display:none"></div>
                <button type="submit" class="btn-primary">Alterar Email</button>
            </form>
        </div>
    `;

    document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('settings-error');

        const { error } = await updateProfile(user.id, {
            name: document.getElementById('settings-name').value,
            location: document.getElementById('settings-location').value,
            avatar_url: document.getElementById('settings-avatar').value,
        });

        if (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            return;
        }

        showToast('Perfil atualizado!', 'success');
    });

    document.getElementById('password-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('password-error');
        const newPassword = document.getElementById('new-password').value;

        const { error } = await updatePassword(newPassword);
        if (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            return;
        }

        showToast('Senha alterada!', 'success');
        document.getElementById('password-form').reset();
    });

    document.getElementById('email-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('email-error');
        const newEmail = document.getElementById('new-email').value;

        const { error } = await updateEmail(newEmail);
        if (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            return;
        }

        showToast('Email atualizado! Verifique sua caixa de entrada.', 'success');
    });
}
