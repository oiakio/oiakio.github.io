// ============================================
// PERFIS
// ============================================

async function renderOwnProfile() {
    const user = await fetchCurrentUser();
    if (!user) return;

    const app = document.getElementById('app');
    const { data: profile } = await fetchProfile(user.id);

    app.innerHTML = `
        <div class="page profile-page">
            <div class="profile-header">
                <img src="${profile?.avatar_url || ''}" alt="Avatar" class="profile-avatar">
                <div class="profile-info">
                    <h2>${profile?.name || 'Sem nome'}</h2>
                    <p>${profile?.location || ''}</p>
                </div>
            </div>
            <div class="profile-tabs">
                <button class="tab-btn active" data-tab="watched">Assistidos</button>
                <button class="tab-btn" data-tab="favorites">Favoritos</button>
                <button class="tab-btn" data-tab="likes">Gostei</button>
                <button class="tab-btn" data-tab="dislikes">Não gostei</button>
                <button class="tab-btn" data-tab="watchlist">Quero ver</button>
            </div>
            <div class="profile-content" id="profile-content">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProfileTab(btn.dataset.tab, user.id);
        });
    });

    loadProfileTab('watched', user.id);
}

async function loadProfileTab(tab, userId) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    if (tab === 'watched') {
        const { data } = await fetchWatched(userId);
        container.innerHTML = data?.length ? data.map(w => {
            const isEpisode = w.episode_id !== null;
            let displayTitle = w.catalog?.title || '';
            
            if (isEpisode && w.episode) {
                // Obter número da temporada do objeto season
                const seasonNum = w.episode.season?.season_number || 1;
                const epNum = w.episode.episode_number || '';
                const epTitle = w.episode.title || `Episódio ${epNum}`;
                const epCode = `S${seasonNum.toString().padStart(2, '0')}E${epNum.toString().padStart(2, '0')}`;
                displayTitle = `${w.catalog?.title} - ${epTitle} (${epCode})`;
            }
            
            return `
            <div class="history-item" onclick="navigate('#/assistir/${w.episode_id ? 'episode' : 'movie'}/${w.episode_id || w.catalog_id}')">
                <img src="${w.catalog?.poster || ''}" alt="${displayTitle}">
                <div>
                    <h4>${displayTitle}</h4>
                    <span>${formatDate(w.watched_at)}</span>
                </div>
            </div>
        `}).join('') : '<p class="empty-msg">Nenhum conteúdo marcado como assistido ainda.</p>';
    } else if (tab === 'favorites') {
        const { data } = await fetchFavorites(userId);
        container.innerHTML = data?.length ? data.map(f => `
            <div class="history-item" onclick="openDetailModal('${f.catalog_id}')">
                <img src="${f.catalog?.poster || ''}" alt="${f.catalog?.title || ''}">
                <div><h4>${f.catalog?.title || ''}</h4></div>
            </div>
        `).join('') : '<p class="empty-msg">Nenhum favorito ainda.</p>';
    } else if (tab === 'likes') {
        const { data } = await fetchLikes(userId);
        container.innerHTML = data?.length ? data.map(f => `
            <div class="history-item" onclick="openDetailModal('${f.catalog_id}')">
                <img src="${f.catalog?.poster || ''}" alt="${f.catalog?.title || ''}">
                <div><h4>${f.catalog?.title || ''}</h4></div>
            </div>
        `).join('') : '<p class="empty-msg">Nenhum "Gostei" ainda.</p>';
    } else if (tab === 'dislikes') {
        const { data } = await fetchDislikes(userId);
        container.innerHTML = data?.length ? data.map(d => `
            <div class="history-item" onclick="openDetailModal('${d.catalog_id}')">
                <img src="${d.catalog?.poster || ''}" alt="${d.catalog?.title || ''}">
                <div><h4>${d.catalog?.title || ''}</h4></div>
            </div>
        `).join('') : '<p class="empty-msg">Nenhum "Não gostei" ainda.</p>';
    } else if (tab === 'watchlist') {
        const { data } = await fetchWatchlist(userId);
        container.innerHTML = data?.length ? data.map(w => `
            <div class="history-item" onclick="openDetailModal('${w.catalog_id}')">
                <img src="${w.catalog?.poster || ''}" alt="${w.catalog?.title || ''}">
                <div><h4>${w.catalog?.title || ''}</h4></div>
            </div>
        `).join('') : '<p class="empty-msg">Sua lista "Quero ver" está vazia.</p>';
    }
}

async function renderPublicProfile(hash) {
    const targetId = hash.split('/')[2];
    const app = document.getElementById('app');
    app.innerHTML = '<div class="page"><div class="loading-spinner"></div></div>';

    const { data: profile } = await fetchProfile(targetId);
    if (!profile) {
        app.innerHTML = '<div class="page"><p>Perfil não encontrado.</p></div>';
        return;
    }

    const { data: history } = await fetchWatchHistory(targetId, 100);

    app.innerHTML = `
        <div class="page profile-page">
            <div class="profile-header">
                <img src="${profile.avatar_url || ''}" alt="Avatar" class="profile-avatar">
                <div class="profile-info">
                    <h2>${profile.name || 'Sem nome'}</h2>
                    <p>${profile.location || ''}</p>
                </div>
            </div>
            <div class="profile-content">
                <h3>Histórico público</h3>
                <div class="history-list">
                    ${history?.length ? history.map(h => `
                        <div class="history-item">
                            <img src="${h.catalog?.poster || ''}" alt="${h.catalog?.title || ''}">
                            <div>
                                <h4>${h.catalog?.title || ''}</h4>
                                <span>${formatDate(h.watched_at)}</span>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-msg">Nenhum histórico público.</p>'}
                </div>
            </div>
        </div>
    `;
}
