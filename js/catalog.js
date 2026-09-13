// ============================================
// CATÁLOGO - PÁGINAS DE FILMES, SÉRIES, ANIMES
// ============================================

async function renderCatalog(type) {
    const app = document.getElementById('app');
    const labels = { movie: 'Filmes', tv: 'Séries', anime: 'Animes' };

    app.innerHTML = `
        <div class="page catalog-page">
            <div class="page-header">
                <h2 class="page-title">${labels[type] || 'Catálogo'}</h2>
                <div class="catalog-filters">
                    <div class="search-wrapper">
                        ${getIcon('search', 18)}
                        <input type="text" id="catalog-search" placeholder="Buscar título..." class="search-input">
                    </div>
                    <select id="catalog-genre" class="filter-select">
                        <option value="">Todos os gêneros</option>
                    </select>
                    <select id="catalog-year" class="filter-select">
                        <option value="">Todos os anos</option>
                    </select>
                    <select id="catalog-rating" class="filter-select">
                        <option value="">Todas as notas</option>
                        <option value="5">5 estrelas</option>
                        <option value="4">4+ estrelas</option>
                        <option value="3">3+ estrelas</option>
                        <option value="2">2+ estrelas</option>
                        <option value="1">1+ estrela</option>
                    </select>
                    <select id="catalog-sort" class="filter-select">
                        <option value="newest">Mais recentes</option>
                        <option value="oldest">Mais antigos</option>
                        <option value="title">A-Z</option>
                        <option value="rating">Maior nota</option>
                    </select>
                </div>
            </div>
            <div class="catalog-grid" id="catalog-grid">
                <div class="loading-spinner"></div>
            </div>
            <div class="empty-state" id="catalog-empty" style="display:none">
                <p>Nenhum conteúdo encontrado.</p>
            </div>
        </div>
    `;

    const grid = document.getElementById('catalog-grid');
    const searchInput = document.getElementById('catalog-search');
    const sortSelect = document.getElementById('catalog-sort');
    const genreSelect = document.getElementById('catalog-genre');
    const yearSelect = document.getElementById('catalog-year');
    const ratingSelect = document.getElementById('catalog-rating');

    const loadCatalog = async (search = '') => {
        grid.innerHTML = '<div class="loading-spinner"></div>';
        document.getElementById('catalog-empty').style.display = 'none';

        const sortValue = sortSelect?.value || 'newest';
        let orderBy = 'created_at';
        let ascending = false;

        if (sortValue === 'oldest') ascending = true;
        if (sortValue === 'title') { orderBy = 'title'; ascending = true; }
        if (sortValue === 'rating') { orderBy = 'imdb_rating'; ascending = false; }

        const genre = genreSelect?.value || '';
        const year = yearSelect?.value || '';
        const rating = ratingSelect?.value || '';

        const { data, error } = await fetchCatalog(type, { search, genre, year, rating });

        grid.innerHTML = '';
        if (error || !data || data.length === 0) {
            document.getElementById('catalog-empty').style.display = '';
            return;
        }

        const user = await fetchCurrentUser();
        let watchedIds = new Set();
        let favIds = new Set();
        let likeIds = new Set();
        let dislikeIds = new Set();
        let watchlistIds = new Set();
        if (user && data.length > 0) {
            const { data: watchedData } = await fetchWatched(user.id);
            watchedData.forEach(w => watchedIds.add(w.catalog_id));
            const { data: favData } = await fetchFavorites(user.id);
            favData.forEach(f => favIds.add(f.catalog_id));
            const { data: likeData } = await fetchLikes(user.id);
            likeData.forEach(l => likeIds.add(l.catalog_id));
            const { data: dislikeData } = await fetchDislikes(user.id);
            dislikeData.forEach(d => dislikeIds.add(d.catalog_id));
            const { data: watchlistData } = await fetchWatchlist(user.id);
            watchlistData.forEach(w => watchlistIds.add(w.catalog_id));
        }

        grid.innerHTML = data.map(item => {
            const watched = watchedIds.has(item.id);
            const favorited = favIds.has(item.id);
            const liked = likeIds.has(item.id);
            const disliked = dislikeIds.has(item.id);
            const watchlisted = watchlistIds.has(item.id);
            return createContentCard(item, type, `openDetailModal('${item.id}')`, watched, favorited, liked, disliked, watchlisted);
        }).join('');
    };

    const populateFilters = async () => {
        const { data: allItems } = await fetchCatalog(type);
        const genres = new Set();
        const years = new Set();
        (allItems || []).forEach(item => {
            (item.genres || []).forEach(g => genres.add(g));
            if (item.release_year) years.add(item.release_year);
        });
        const sortedGenres = Array.from(genres).sort();
        const sortedYears = Array.from(years).sort((a, b) => b - a);
        sortedGenres.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g;
            opt.textContent = g;
            genreSelect.appendChild(opt);
        });
        sortedYears.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });
    };

    await populateFilters();

    searchInput?.addEventListener('input', debounce((e) => loadCatalog(e.target.value), 300));
    sortSelect?.addEventListener('change', () => loadCatalog(searchInput?.value || ''));
    genreSelect?.addEventListener('change', () => loadCatalog(searchInput?.value || ''));
    yearSelect?.addEventListener('change', () => loadCatalog(searchInput?.value || ''));
    ratingSelect?.addEventListener('change', () => loadCatalog(searchInput?.value || ''));

    await loadCatalog();
    await updateAllCatalogButtons();
}

async function updateAllCatalogButtons() {
    const user = await fetchCurrentUser();
    if (!user) return;

    const { data: watchedData } = await fetchWatched(user.id);
    const { data: favData } = await fetchFavorites(user.id);
    const { data: likeData } = await fetchLikes(user.id);
    const { data: dislikeData } = await fetchDislikes(user.id);
    const { data: watchlistData } = await fetchWatchlist(user.id);

    const watchedIds = new Set((watchedData || []).map(w => w.catalog_id));
    const favIds = new Set((favData || []).map(f => f.catalog_id));
    const likeIds = new Set((likeData || []).map(l => l.catalog_id));
    const dislikeIds = new Set((dislikeData || []).map(d => d.catalog_id));
    const watchlistIds = new Set((watchlistData || []).map(w => w.catalog_id));

    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        const id = card.dataset.id;
        if (!id) return;

        const watchedBtn = document.getElementById(`watched-btn-${id}`);
        const favBtn = document.getElementById(`fav-btn-${id}`);
        const likeBtn = document.getElementById(`like-btn-${id}`);
        const dislikeBtn = document.getElementById(`dislike-btn-${id}`);
        const wlBtn = document.getElementById(`wl-btn-${id}`);

        if (watchedBtn) watchedBtn.classList.toggle('active', watchedIds.has(id));
        if (favBtn) favBtn.classList.toggle('active', favIds.has(id));
        if (likeBtn) likeBtn.classList.toggle('active', likeIds.has(id));
        if (dislikeBtn) dislikeBtn.classList.toggle('active', dislikeIds.has(id));
        if (wlBtn) wlBtn.classList.toggle('active', watchlistIds.has(id));
    });
}

async function openDetailModal(catalogId) {
    const { data: item } = await fetchCatalogById(catalogId);
    if (!item) return;

    const user = await fetchCurrentUser();
    const isSeries = item.content_type === 'tv' || item.content_type === 'anime';

    let seasonsHtml = '';
    if (isSeries) {
        const { data: seasons } = await fetchSeasons(catalogId);
        const seasonsWithEpisodes = await Promise.all(
            (seasons || []).map(async (s) => {
                const { data: episodes } = await fetchEpisodes(s.id);
                return { ...s, episodes: episodes || [] };
            })
        );
        seasonsHtml = `
            <div class="seasons-list">
                <h3>Temporadas</h3>
                <div class="season-items">
                    ${seasonsWithEpisodes.map(s => `
                        <div class="season-item">
                            <h4>Temporada ${s.season_number}</h4>
                            <div class="episodes-list">
                                ${s.episodes.map(ep => `
                                    <div class="episode-item" data-episode-id="${ep.id}">
                                        <span class="episode-number">${ep.episode_number}</span>
                                        <span class="episode-title">${ep.title || 'Episódio'}</span>
                                        ${ep.video_url ? `<button class="btn-play" onclick="navigate('#/assistir/episode/${ep.id}')">${getIcon('play', 16)}</button>` : ''}
                                        <button class="btn-watched-episode" id="watched-ep-btn-${ep.id}" onclick="toggleEpisodeWatched('${item.id}', '${ep.id}')">${getIcon('check', 16)}</button>
                                    </div>
                                `).join('') || '<p>Nenhum episódio</p>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const favBtn = user ? `
        <button class="btn-fav" id="fav-btn-${item.id}" onclick="toggleItemFavorite('${item.id}')">
            ${getIcon('star', 20)}
        </button>
    ` : '';

    const likeBtn = user ? `
        <button class="btn-like" id="like-btn-${item.id}" onclick="toggleItemLike('${item.id}')">
            ${getIcon('like', 20)}
        </button>
    ` : '';

    const watchlistBtn = user ? `
        <button class="btn-watchlist" id="wl-btn-${item.id}" onclick="toggleItemWatchlist('${item.id}')">
            ${getIcon('plus', 20)}
        </button>
    ` : '';

    const watchedBtn = user ? `
        <button class="btn-watched" id="watched-btn-${item.id}" onclick="toggleItemWatched('${item.id}')">
            ${getIcon('check', 20)}
        </button>
    ` : '';

    const dislikeBtn = user ? `
        <button class="btn-dislike" id="dislike-btn-${item.id}" onclick="toggleItemDislike('${item.id}')">
            ${getIcon('dislike', 20)}
        </button>
    ` : '';

    const modalHtml = `
        <div class="modal-overlay" id="detail-modal">
            <div class="ticket-modal">
                <button class="modal-close" onclick="closeDetailModal()">×</button>
                <div class="ticket-side">
                    <img src="${item.poster || ''}" alt="${item.title}" class="ticket-poster">
                    <h1>${item.title}</h1>
                    <div class="ticket-meta">
                        <span>${item.release_year || ''}</span>
                        <span>${item.imdb_rating ? '⭐ ' + item.imdb_rating.toFixed(1) : ''}</span>
                        <span>${isSeries ? 'Série' : 'Filme'}</span>
                    </div>
                </div>
                <div class="ticket-main">
                    <p class="detail-synopsis">${item.synopsis || 'Sem sinopse.'}</p>
                    <div class="detail-genres">
                        ${item.genres?.length ? item.genres.map(g => `<span class="tag" onclick="window.filterByGenre('${g}')">${g}</span>`).join('') : ''}
                    </div>
                    ${item.directors?.length ? `<p><strong>Diretor:</strong> ${item.directors.map(d => `<span class="tag" onclick="window.filterByPerson('${d}')">${d}</span>`).join(', ')}</p>` : ''}
                    ${item.writers?.length ? `<p><strong>Roteirista:</strong> ${item.writers.map(w => `<span class="tag" onclick="window.filterByPerson('${w}')">${w}</span>`).join(', ')}</p>` : ''}
                    ${item.cast_members?.length ? `<p><strong>Elenco:</strong> ${item.cast_members.map(c => `<span class="tag" onclick="window.filterByPerson('${c}')">${c}</span>`).join(', ')}</p>` : ''}
                    ${seasonsHtml}
                     <div class="detail-actions">
                         ${isSeries ? '' : `<button class="btn-primary" onclick="openDTubeEmbedModal('${item.video_url}')">Entrar</button>`}
                         ${watchedBtn}
                         ${favBtn}
                         ${likeBtn}
                         ${dislikeBtn}
                         ${watchlistBtn}
                     </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('detail-modal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('detail-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'detail-modal') closeDetailModal();
    });

    if (user) {
        try {
            await updateFavoriteButton(item.id);
            await updateWatchlistButton(item.id);
            const watchedState = await isWatched(user.id, item.id);
            console.log('openDetailModal watchedState:', item.id, watchedState);
            await updateWatchedButton(item.id, watchedState);
            const likedState = await isLiked(user.id, item.id);
            await updateLikeButton(item.id, likedState);
            const dislikedState = await isDisliked(user.id, item.id);
            await updateDislikeButton(item.id, dislikedState);
            
            // Atualizar botões de episódios vistos
            if (isSeries) {
                const { data: seasons } = await fetchSeasons(item.id);
                for (const season of (seasons || [])) {
                    const { data: episodes } = await fetchEpisodes(season.id);
                    for (const ep of (episodes || [])) {
                        const epWatched = await isWatched(user.id, item.id, ep.id);
                        const btn = document.getElementById(`watched-ep-btn-${ep.id}`);
                        if (btn) {
                            btn.classList.toggle('active', epWatched);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Erro ao atualizar botões:', err);
        }
    }

    const admin = await isAdmin();
    if (admin) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon btn-danger';
        deleteBtn.innerHTML = getIcon('trash', 20);
        deleteBtn.onclick = () => adminDeleteCatalogItem(item.id);
        deleteBtn.style.marginLeft = '1rem';
        const actionsDiv = document.querySelector('.ticket-body .detail-actions');
        if (actionsDiv) actionsDiv.appendChild(deleteBtn);
    }
}

window.closeDetailModal = closeDetailModal;
window.openDetailModal = openDetailModal;

function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.remove();
}

function isDTubeUrl(url) {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.hostname === 'd.tube' || u.hostname === 'play.d.tube' || url.includes('d.tube');
    } catch {
        return false;
    }
}

function getDTubeEmbedUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        let videoId = u.searchParams.get('v');
        if (!videoId) {
            const match = url.match(/d\.tube\/?\/v\/([^/?#]+)/);
            if (match) videoId = match[1];
        }
        if (!videoId) return null;
        if (url.includes('play.d.tube')) {
            return `https://play.d.tube/embed/?v=${videoId}`;
        }
        return `https://d.tube/embed/v/${videoId}`;
    } catch {
        return null;
    }
}

function openDTubeEmbedModal(url) {
    if (!isDTubeUrl(url)) return;
    const embedUrl = getDTubeEmbedUrl(url);
    if (!embedUrl) return;

    closeDetailModal();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'dtube-embed-modal';
    modal.innerHTML = `
        <div style="width:90vw;height:80vh;max-width:1200px;background:#000;position:relative;">
            <button class="modal-close" onclick="document.getElementById('dtube-embed-modal').remove()">×</button>
            <iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    window.closeDTubeEmbedModal = function() {
        const m = document.getElementById('dtube-embed-modal');
        if (m) m.remove();
    };
}

async function toggleItemFavorite(catalogId) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const watched = await isWatched(user.id, catalogId);
    if (!watched) {
        await toggleWatched(user.id, catalogId);
        updateWatchedButton(catalogId, true);
    }
    if (await isWatchlisted(user.id, catalogId)) {
        await toggleWatchlist(user.id, catalogId);
        updateWatchlistButton(catalogId, false);
    }
    if (await isDisliked(user.id, catalogId)) {
        await toggleDislike(user.id, catalogId);
        updateDislikeButton(catalogId, false);
    }
    const { favorited } = await toggleFavorite(user.id, catalogId);
    updateFavoriteButton(catalogId, favorited);
}

async function updateFavoriteButton(catalogId, forceState = null) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const fav = forceState !== null ? forceState : await isFavorited(user.id, catalogId);
    const btn = document.getElementById(`fav-btn-${catalogId}`);
    if (btn) {
        btn.classList.toggle('active', fav);
    }
}

async function toggleItemWatchlist(catalogId) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const { watchlisted } = await toggleWatchlist(user.id, catalogId);
    updateWatchlistButton(catalogId, watchlisted);
}

async function updateWatchlistButton(catalogId, forceState = null) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const wl = forceState !== null ? forceState : await isWatchlisted(user.id, catalogId);
    const btn = document.getElementById(`wl-btn-${catalogId}`);
    if (btn) {
        btn.classList.toggle('active', wl);
    }
}

async function toggleItemWatched(catalogId) {
    const user = await fetchCurrentUser();
    if (!user) return;
    
    // Verificar se é série/anime
    const { data: item } = await fetchCatalogById(catalogId);
    const isSeries = item && (item.content_type === 'tv' || item.content_type === 'anime');
    
    const { watched } = await toggleWatched(user.id, catalogId);
    updateWatchedButton(catalogId, watched);
    
    // Se for série/anime, marcar/desmarcar todos os episódios
    if (isSeries && item) {
        const { data: seasons } = await fetchSeasons(catalogId);
        for (const season of (seasons || [])) {
            const { data: episodes } = await fetchEpisodes(season.id);
            for (const ep of (episodes || [])) {
                if (watched) {
                    await markAsWatched(user.id, catalogId, ep.id);
                } else {
                    await unmarkAsWatched(user.id, catalogId, ep.id);
                }
                // Atualizar botão do episódio se estiver visível
                const epBtn = document.getElementById(`watched-ep-btn-${ep.id}`);
                if (epBtn) {
                    epBtn.classList.toggle('active', watched);
                }
            }
        }
    }
    
    if (watched && await isWatchlisted(user.id, catalogId)) {
        await toggleWatchlist(user.id, catalogId);
        updateWatchlistButton(catalogId, false);
    }
}

async function updateWatchedButton(catalogId, forceState = null) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const watched = forceState !== null ? forceState : await isWatched(user.id, catalogId);
    const btn = document.getElementById(`watched-btn-${catalogId}`);
    if (btn) {
        btn.classList.toggle('active', watched);
    }
}

async function toggleItemLike(catalogId) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const { liked } = await toggleLike(user.id, catalogId);
    updateLikeButton(catalogId, liked);
    if (liked && await isWatchlisted(user.id, catalogId)) {
        await toggleWatchlist(user.id, catalogId);
        updateWatchlistButton(catalogId, false);
    }
    if (liked && await isDisliked(user.id, catalogId)) {
        await toggleDislike(user.id, catalogId);
        updateDislikeButton(catalogId, false);
    }
}

async function toggleItemDislike(catalogId) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const { disliked } = await toggleDislike(user.id, catalogId);
    updateDislikeButton(catalogId, disliked);
    if (disliked) {
        if (await isFavorited(user.id, catalogId)) {
            await toggleFavorite(user.id, catalogId);
            updateFavoriteButton(catalogId, false);
        }
        if (await isLiked(user.id, catalogId)) {
            await toggleLike(user.id, catalogId);
            updateLikeButton(catalogId, false);
        }
        if (await isWatchlisted(user.id, catalogId)) {
            await toggleWatchlist(user.id, catalogId);
            updateWatchlistButton(catalogId, false);
        }
    }
}

async function updateDislikeButton(catalogId, forceState = null) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const disliked = forceState !== null ? forceState : await isDisliked(user.id, catalogId);
    const btn = document.getElementById(`dislike-btn-${catalogId}`);
    if (btn) {
        btn.classList.toggle('active', disliked);
    }
}

async function updateLikeButton(catalogId, forceState = null) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const liked = forceState !== null ? forceState : await isLiked(user.id, catalogId);
    const btn = document.getElementById(`like-btn-${catalogId}`);
    if (btn) {
        btn.classList.toggle('active', liked);
    }
}

window.filterByGenre = function(genre) {
    closeDetailModal();
    const hash = window.location.hash || '#/filmes';
    const type = hash.includes('series') ? 'tv' : hash.includes('animes') ? 'anime' : 'movie';
    navigate(`#/${type === 'tv' ? 'series' : type === 'anime' ? 'animes' : 'filmes'}`);
    setTimeout(() => {
        const genreSelect = document.getElementById('catalog-genre');
        if (genreSelect) {
            genreSelect.value = genre;
            genreSelect.dispatchEvent(new Event('change'));
        }
    }, 100);
};

window.filterByPerson = function(person) {
    closeDetailModal();
    const hash = window.location.hash || '#/filmes';
    const type = hash.includes('series') ? 'tv' : hash.includes('animes') ? 'anime' : 'movie';
    navigate(`#/${type === 'tv' ? 'series' : type === 'anime' ? 'animes' : 'filmes'}`);
    setTimeout(() => {
        const searchInput = document.getElementById('catalog-search');
        if (searchInput) {
            searchInput.value = person;
            searchInput.dispatchEvent(new Event('input'));
        }
    }, 100);
};

window.toggleItemDislike = toggleItemDislike;
window.toggleItemLike = toggleItemLike;
window.updateLikeButton = updateLikeButton;
window.updateAllCatalogButtons = updateAllCatalogButtons;

async function toggleEpisodeWatched(episodeId, catalogId) {
    const user = await fetchCurrentUser();
    if (!user) return;
    
    const { watched } = await toggleWatched(user.id, catalogId, episodeId);
    const btn = document.getElementById(`watched-ep-btn-${episodeId}`);
    if (btn) {
        btn.classList.toggle('active', watched);
    }
}

window.toggleEpisodeWatched = toggleEpisodeWatched;
