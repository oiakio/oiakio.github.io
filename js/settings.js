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
                    <label for="settings-avatar">Avatar</label>
                    <div class="avatar-upload-section">
                        <img src="${profile?.avatar_url || ''}" alt="Avatar atual" class="settings-avatar-preview" id="settings-avatar-preview">
                        <input type="file" id="settings-avatar-file" accept="image/*" style="display:none">
                        <button type="button" class="btn-secondary" onclick="document.getElementById('settings-avatar-file').click()">
                            ${getIcon('upload', 16)} Escolher Imagem
                        </button>
                        <input type="hidden" id="settings-avatar" value="${profile?.avatar_url || ''}">
                    </div>
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

    // Handler para upload de avatar
    const avatarFileInput = document.getElementById('settings-avatar-file');
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', handleSettingsAvatarUpload);
    }

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

// ============================================
// UPLOAD DE AVATAR
// ============================================

async function handleSettingsAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Por favor, selecione uma imagem.', 'error');
        return;
    }

    const user = await fetchCurrentUser();
    if (!user) return;

    try {
        const compressedFile = await compressImage(file);
        const publicUrl = await uploadAvatarToSupabase(user.id, compressedFile);
        
        // Atualizar campo hidden
        document.getElementById('settings-avatar').value = publicUrl;
        
        // Atualizar preview
        const preview = document.getElementById('settings-avatar-preview');
        if (preview) {
            preview.src = publicUrl;
        }
        
        showToast('Avatar carregado! Clique em "Salvar Perfil" para confirmar.', 'success');
    } catch (error) {
        console.error('Erro ao fazer upload do avatar:', error);
        showToast('Erro ao carregar avatar.', 'error');
    }
    
    e.target.value = '';
}

function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    },
                    'image/jpeg',
                    quality
                );
            };
        };
    });
}

async function uploadAvatarToSupabase(userId, file) {
    const db = getSupabase();
    if (!db) throw new Error('Supabase não inicializado');

    const fileName = `${userId}/${Date.now()}.jpg`;
    const { data, error } = await db.storage
        .from('avatars')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) throw error;

    const { data: { publicUrl } } = db.storage
        .from('avatars')
        .getPublicUrl(fileName);

    return publicUrl;
}

window.handleSettingsAvatarUpload = handleSettingsAvatarUpload;
