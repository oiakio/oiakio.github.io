// ============================================
// ADMIN
// ============================================

// Função utilitária para parsear formato S01E01
function parseSeasonEpisode(code) {
    const match = code.match(/S(\d+)E(\d+)/i);
    if (match) {
        return {
            season: parseInt(match[1]),
            episode: parseInt(match[2])
        };
    }
    return null;
}

// Formata número para S01E01
function formatSeasonEpisode(season, episode) {
    const s = season.toString().padStart(2, '0');
    const e = episode.toString().padStart(2, '0');
    return `S${s}E${e}`;
}

async function renderAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        navigate('#/home');
        return;
    }

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page admin-page">
            <div class="admin-sidebar">
                <h3>Admin</h3>
                <button class="admin-nav active" data-section="content">Conteúdo</button>
                <button class="admin-nav" data-section="users">Usuários</button>
                <button class="admin-nav" data-section="requests">Pedidos</button>
                <button class="admin-nav" data-section="tmdb">TMDB</button>
            </div>
            <div class="admin-main" id="admin-main">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;

    document.querySelectorAll('.admin-nav').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-nav').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadAdminSection(btn.dataset.section);
        });
    });

    loadAdminSection('content');
}

async function loadAdminSection(section) {
    const main = document.getElementById('admin-main');
    if (!main) return;

    if (section === 'content') {
        const { data } = await fetchAllCatalog();
        main.innerHTML = `
            <div class="admin-header">
                <h2>Catálogo</h2>
                <button class="btn-primary" onclick="window.showAddContentModal()">${getIcon('plus', 18)} Novo</button>
            </div>
            <div class="admin-table">
                <table>
                    <thead>
                        <tr><th>Título</th><th>Tipo</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${(data || []).map(item => `
                            <tr>
                                <td>${item.title}</td>
                                <td>${item.content_type}</td>
                                <td>${item.is_active ? 'Em Cartaz' : 'Fora de Cartaz'}</td>
                                <td>
                                    <button class="btn-icon" onclick="window.editCatalogItem('${item.id}')">${getIcon('edit', 16)}</button>
                                    <button class="btn-icon" onclick="window.toggleCatalogActive('${item.id}', ${!item.is_active})">${item.is_active ? 'Desativar' : 'Ativar'}</button>
                                    <button class="btn-icon btn-danger" onclick="window.adminDeleteCatalogItem('${item.id}')">${getIcon('trash', 16)}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (section === 'users') {
        const { data } = await fetchAllUsers();
        main.innerHTML = `
            <div class="admin-header">
                <h2>Usuários</h2>
                <button class="btn-primary" onclick="showAddUserModal()">${getIcon('plus', 18)} Novo</button>
            </div>
            <div class="admin-table">
                <table>
                    <thead>
                        <tr><th>Nome</th><th>Email</th><th>Papel</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${(data || []).map(u => `
                            <tr>
                                <td>${u.name || ''}</td>
                                <td>${u.email || ''}</td>
                                <td>${u.role || 'user'}</td>
                                <td>
                                    <button class="btn-icon" onclick="editUserRole('${u.id}')">${getIcon('edit', 16)}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (section === 'requests') {
        const { data } = await fetchRequests();
        main.innerHTML = `
            <div class="admin-header"><h2>Pedidos</h2></div>
            <div class="admin-table">
                <table>
                    <thead>
                        <tr><th>Título</th><th>Tipo</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${(data || []).map(r => `
                            <tr>
                                <td>${r.title}</td>
                                    <td>${r.content_type}</td>
                                <td>${r.status}</td>
                                <td>
                                    <button class="btn-primary" onclick="adminUpdateRequestStatus('${r.id}', 'approved')">Aprovar</button>
                                    <button class="btn-secondary" onclick="adminUpdateRequestStatus('${r.id}', 'rejected')">Rejeitar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (section === 'tmdb') {
        main.innerHTML = `
            <div class="admin-header"><h2>Buscar no TMDB</h2></div>
            <div class="tmdb-search">
                <input type="text" id="tmdb-query" placeholder="Buscar filme, série ou anime...">
                <select id="tmdb-type">
                    <option value="movie">Filme</option>
                    <option value="tv">Série</option>
                </select>
                <button class="btn-primary" id="tmdb-search-btn">Buscar</button>
            </div>
            <div class="tmdb-results" id="tmdb-results"></div>
        `;

        document.getElementById('tmdb-search-btn')?.addEventListener('click', async () => {
            const query = document.getElementById('tmdb-query').value;
            const type = document.getElementById('tmdb-type').value;
            const results = await tmdbSearch(query, type);
            const container = document.getElementById('tmdb-results');
            container.innerHTML = results.map(r => `
                <div class="tmdb-result" onclick="selectTmdbItem(${r.id}, '${type}')">
                    <img src="${tmdbImageUrl(r.poster_path, 'w200')}" alt="${r.title || r.name}">
                    <div>
                        <h4>${r.title || r.name}</h4>
                        <span>${r.release_date || r.first_air_date || ''}</span>
                    </div>
                </div>
            `).join('');
        });
    }
}

async function showAddContentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal modal-lg">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h3>Novo Conteúdo</h3>
            <div class="tmdb-search-inline">
                <input type="text" id="tmdb-query" placeholder="Buscar no TMDB...">
                <select id="tmdb-type">
                    <option value="movie">Filme</option>
                    <option value="tv">Série</option>
                    <option value="anime">Anime</option>
                </select>
                <button class="btn-secondary" id="tmdb-search-btn">Buscar</button>
            </div>
            <div class="tmdb-results" id="tmdb-results"></div>
            <form id="add-content-form">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" id="new-title" required>
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <select id="new-type" onchange="toggleSeriesFields()">
                        <option value="movie">Filme</option>
                        <option value="tv">Série</option>
                        <option value="anime">Anime</option>
                    </select>
                </div>
                <div class="form-group" id="video-url-group">
                    <label>URL do Vídeo</label>
                    <input type="url" id="new-video" placeholder="Deixe em branco para adicionar depois">
                </div>
                <div id="series-fields" style="display:none;">
                    <div class="form-group">
                        <label>Temporadas e Episódios</label>
                        <div id="seasons-container"></div>
                        <button type="button" class="btn-secondary" onclick="addSeasonField()">+ Adicionar Temporada</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Poster URL</label>
                    <input type="url" id="new-poster" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Backdrop URL</label>
                    <input type="url" id="new-backdrop" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label>Sinopse</label>
                    <textarea id="new-synopsis" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Gêneros (separados por vírgula)</label>
                    <input type="text" id="new-genres" placeholder="Ação, Aventura, Drama">
                </div>
                <div class="form-group">
                    <label>Ano</label>
                    <input type="number" id="new-year" placeholder="2024">
                </div>
                <div class="form-group">
                    <label>Diretor(es)</label>
                    <input type="text" id="new-directors" placeholder="Nome do diretor">
                </div>
                <div class="form-group">
                    <label>Roteirista(s)</label>
                    <input type="text" id="new-writers" placeholder="Nome do roteirista">
                </div>
                <div class="form-group">
                    <label>Elenco (separados por vírgula)</label>
                    <input type="text" id="new-cast" placeholder="Ator 1, Ator 2, Ator 3">
                </div>
                <div class="form-group">
                    <label>Nota IMDb</label>
                    <input type="number" id="new-rating" placeholder="8.5" step="0.1">
                </div>
                <div id="add-error" class="login-error" style="display:none"></div>
                <button type="submit" class="btn-primary">Salvar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Funções para gerenciar campos de série/anime
    window.toggleSeriesFields = function() {
        const type = document.getElementById('new-type').value;
        const videoGroup = document.getElementById('video-url-group');
        const seriesFields = document.getElementById('series-fields');
        const videoInput = document.getElementById('new-video');

        if (type === 'tv' || type === 'anime') {
            videoGroup.style.display = 'none';
            videoInput.removeAttribute('required');
            seriesFields.style.display = 'block';
        } else {
            videoGroup.style.display = 'block';
            videoInput.setAttribute('required', 'required');
            seriesFields.style.display = 'none';
        }
    };

    window.addSeasonField = function(seasonNum = null) {
        const container = document.getElementById('seasons-container');
        const seasonIndex = container.children.length + 1;
        const seasonNumValue = seasonNum || seasonIndex;

        const seasonDiv = document.createElement('div');
        seasonDiv.className = 'season-field';
        seasonDiv.dataset.seasonIndex = seasonIndex;
        seasonDiv.innerHTML = `
            <div class="season-header">
                <label>Temporada ${seasonNumValue} (S${seasonNumValue.toString().padStart(2, '0')})</label>
                <button type="button" class="btn-icon btn-danger" onclick="this.closest('.season-field').remove()">×</button>
            </div>
            <div class="episodes-container" id="episodes-container-${seasonIndex}"></div>
            <button type="button" class="btn-secondary btn-sm" onclick="addEpisodeField(${seasonIndex})">+ Adicionar Episódio</button>
        `;
        container.appendChild(seasonDiv);
    };

    window.addEpisodeField = function(seasonIndex, episodeNum = null) {
        const container = document.getElementById(`episodes-container-${seasonIndex}`);
        const episodeIndex = container.children.length + 1;
        const episodeNumValue = episodeNum || episodeIndex;

        const episodeDiv = document.createElement('div');
        episodeDiv.className = 'episode-field';
        episodeDiv.innerHTML = `
            <div class="episode-row">
                <div class="form-group" style="flex:1;">
                    <label>E${episodeNumValue.toString().padStart(2, '0')}</label>
                    <input type="text" class="episode-code" placeholder="S01E01" value="S${seasonIndex.toString().padStart(2, '0')}E${episodeNumValue.toString().padStart(2, '0')}" data-season="${seasonIndex}" data-episode="${episodeNumValue}">
                </div>
                <div class="form-group" style="flex:2;">
                    <label>Título</label>
                    <input type="text" class="episode-title" placeholder="Título do episódio">
                </div>
                <div class="form-group" style="flex:3;">
                    <label>URL do Vídeo</label>
                    <input type="url" class="episode-url" placeholder="https://...">
                </div>
                <button type="button" class="btn-icon btn-danger" onclick="this.closest('.episode-field').remove()" style="margin-top:20px;">×</button>
            </div>
        `;
        container.appendChild(episodeDiv);
    };

    const searchBtn = document.getElementById('tmdb-search-btn');
    console.log('Modal TMDB - Botão buscar encontrado:', searchBtn);
    
    searchBtn?.addEventListener('click', async () => {
        const query = document.getElementById('tmdb-query').value;
        const type = document.getElementById('tmdb-type').value;
        console.log('Modal TMDB - Buscando:', query, type);
        try {
            const results = await tmdbSearch(query, type);
            console.log('Modal TMDB - Resultados:', results);
            const container = document.getElementById('tmdb-results');
            if (!container) return;
            
            container.innerHTML = results.map(r => `
                <div class="tmdb-result" data-id="${r.id}" data-type="${type}">
                    <img src="${tmdbImageUrl(r.poster_path, 'w200')}" alt="${r.title || r.name}">
                    <div>
                        <h4>${r.title || r.name}</h4>
                        <span>${r.release_date || r.first_air_date || ''}</span>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.tmdb-result').forEach(el => {
                el.addEventListener('click', async () => {
                    console.log('Modal TMDB - Resultado clicado:', el.dataset.id, el.dataset.type);
                    const tmdbId = parseInt(el.dataset.id);
                    const contentType = el.dataset.type;
                    const details = await tmdbGetDetails(tmdbId, contentType);
                    console.log('Modal TMDB - Detalhes:', details);
                    if (!details) return;

                    const data = mapTmdbToCatalog(details, contentType);
                    console.log('Modal TMDB - Dados mapeados:', data);

                    document.getElementById('new-title').value = data.title;
                    document.getElementById('new-type').value = data.content_type;
                    document.getElementById('new-poster').value = data.poster || '';
                    document.getElementById('new-backdrop').value = data.backdrop || '';
                    document.getElementById('new-synopsis').value = data.synopsis || '';
                    document.getElementById('new-genres').value = (data.genres || []).join(', ');
                    document.getElementById('new-year').value = data.release_year || '';
                    document.getElementById('new-directors').value = (data.directors || []).join(', ');
                    document.getElementById('new-writers').value = (data.writers || []).join(', ');
                    document.getElementById('new-cast').value = (data.cast_members || []).join(', ');
                    document.getElementById('new-rating').value = data.imdb_rating || '';

                    document.getElementById('tmdb-results').innerHTML = '';
                    document.getElementById('tmdb-query').value = '';
                });
            });
        } catch (err) {
            console.error('Modal TMDB - Erro na busca:', err);
        }
    });

    document.getElementById('add-content-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('new-title').value;
        const type = document.getElementById('new-type').value;
        const videoUrl = document.getElementById('new-video').value;
        const poster = document.getElementById('new-poster').value;
        const backdrop = document.getElementById('new-backdrop').value;
        const synopsis = document.getElementById('new-synopsis').value;
        const genresRaw = document.getElementById('new-genres').value;
        const releaseYear = document.getElementById('new-year').value;
        const directorsRaw = document.getElementById('new-directors').value;
        const writersRaw = document.getElementById('new-writers').value;
        const castRaw = document.getElementById('new-cast').value;
        const ratingRaw = document.getElementById('new-rating').value;
        const errorEl = document.getElementById('add-error');

        const genres = genresRaw
            ? genresRaw.split(',').map(g => g.trim()).filter(g => g)
            : [];
        const directors = directorsRaw
            ? directorsRaw.split(',').map(d => d.trim()).filter(d => d)
            : [];
        const writers = writersRaw
            ? writersRaw.split(',').map(w => w.trim()).filter(w => w)
            : [];
        const cast_members = castRaw
            ? castRaw.split(',').map(c => c.trim()).filter(c => c)
            : [];

        // Validação para séries/animes - não obriga URL, apenas verifica se tem episódios adicionados
        if ((type === 'tv' || type === 'anime') && !document.querySelector('.episode-url')) {
            errorEl.textContent = 'Para séries e animes, adicione pelo menos uma temporada.';
            errorEl.style.display = 'block';
            return;
        }

        const { data, error } = await createCatalogItem({
            title,
            content_type: type,
            video_url: (type === 'tv' || type === 'anime') ? null : videoUrl,
            poster: poster || null,
            backdrop: backdrop || null,
            synopsis: synopsis || '',
            genres,
            directors,
            writers,
            cast_members,
            release_year: releaseYear ? parseInt(releaseYear) : null,
            imdb_rating: ratingRaw ? parseFloat(ratingRaw) : null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

        if (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            return;
        }

        // Criar temporadas e episódios para séries/animes
        if (type === 'tv' || type === 'anime') {
            const seasonFields = document.querySelectorAll('.season-field');
            
            for (const seasonField of seasonFields) {
                const seasonIndex = parseInt(seasonField.dataset.seasonIndex);
                const episodeFields = seasonField.querySelectorAll('.episode-field');
                
                // Criar temporada
                const { data: seasonData } = await createSeason({
                    catalog_id: data.id,
                    season_number: seasonIndex,
                    title: `Temporada ${seasonIndex}`,
                });

                if (seasonData) {
                    // Criar episódios
                    for (const episodeField of episodeFields) {
                        const episodeCode = episodeField.querySelector('.episode-code').value;
                        const episodeTitle = episodeField.querySelector('.episode-title').value;
                        const episodeUrl = episodeField.querySelector('.episode-url').value;
                        
                        if (!episodeUrl) continue;

                        const parsed = parseSeasonEpisode(episodeCode);
                        const episodeNumber = parsed ? parsed.episode : parseInt(episodeField.querySelector('.episode-code').dataset.episode);

                        await createEpisode({
                            season_id: seasonData.id,
                            catalog_id: data.id,
                            episode_number: episodeNumber,
                            title: episodeTitle || `Episódio ${episodeNumber}`,
                            description: '',
                            video_url: episodeUrl,
                        });
                    }
                }
            }
        }

        modal.remove();
        showToast('Conteúdo adicionado!', 'success');
        loadAdminSection('content');
    });
}

async function showAddUserModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h3>Novo Usuário</h3>
            <form id="add-user-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="new-user-email" required>
                </div>
                <div class="form-group">
                    <label>Senha inicial</label>
                    <input type="password" id="new-user-password" required>
                </div>
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" id="new-user-name" required>
                </div>
                <div class="form-group">
                    <label>Papel</label>
                    <select id="new-user-role">
                        <option value="user">Usuário</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div id="add-user-error" class="login-error" style="display:none"></div>
                <button type="submit" class="btn-primary">Criar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    document.getElementById('add-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('new-user-email').value;
        const password = document.getElementById('new-user-password').value;
        const name = document.getElementById('new-user-name').value;
        const role = document.getElementById('new-user-role').value;
        const errorEl = document.getElementById('add-user-error');

        const db = getSupabase();
        const { data, error } = await db.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role },
        });

        if (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            return;
        }

        modal.remove();
        showToast('Usuário criado!', 'success');
        loadAdminSection('users');
    });
}

async function toggleCatalogActive(id, newState) {
    await updateCatalogItem(id, { is_active: newState });
    showToast(newState ? 'Conteúdo ativado' : 'Conteúdo desativado', 'success');
    loadAdminSection('content');
}

async function adminUpdateRequestStatus(id, status) {
    const db = getSupabase();
    if (!db) return;
    await db
        .from('requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
    showToast(status === 'approved' ? 'Pedido aprovado' : 'Pedido rejeitado', 'success');
    loadAdminSection('requests');
}

async function editUserRole(userId) {
    const { data } = await fetchProfile(userId);
    const newRole = prompt('Papel (user/admin):', data?.role || 'user');
    if (!newRole) return;

    const db = getSupabase();
    await db.from('profiles').update({ role: newRole }).eq('id', userId);
    showToast('Papel atualizado', 'success');
    loadAdminSection('users');
}

async function editCatalogItem(id) {
    const { data: item } = await fetchCatalogById(id);
    if (!item) return;

    const isSeries = item.content_type === 'tv' || item.content_type === 'anime';
    let seasonsHtml = '';
    
    if (isSeries) {
        const { data: seasons } = await fetchSeasons(id);
        for (const season of (seasons || [])) {
            const { data: episodes } = await fetchEpisodes(season.id);
            const episodesList = (episodes || []).map(ep => `
                <div class="episode-field">
                    <div class="episode-row">
                        <div class="form-group" style="flex:1;">
                            <label>E${ep.episode_number.toString().padStart(2, '0')}</label>
                            <input type="text" class="episode-code" value="${formatSeasonEpisode(season.season_number, ep.episode_number)}" data-season="${season.season_number}" data-episode="${ep.episode_number}">
                        </div>
                        <div class="form-group" style="flex:2;">
                            <label>Título</label>
                            <input type="text" class="episode-title" value="${ep.title || ''}">
                        </div>
                        <div class="form-group" style="flex:3;">
                            <label>URL do Vídeo</label>
                            <input type="url" class="episode-url" value="${ep.video_url || ''}" placeholder="https://...">
                        </div>
                        <button type="button" class="btn-icon btn-danger" onclick="deleteEpisode('${ep.id}', this)" style="margin-top:20px;">×</button>
                    </div>
                </div>
            `).join('');
            
            seasonsHtml += `
                <div class="season-field" data-season-index="${season.season_number}" data-season-id="${season.id}">
                    <div class="season-header">
                        <label>Temporada ${season.season_number} (S${season.season_number.toString().padStart(2, '0')})</label>
                        <button type="button" class="btn-icon btn-danger" onclick="deleteSeason('${season.id}', this)">×</button>
                    </div>
                    <div class="episodes-container" id="episodes-container-${season.season_number}">
                        ${episodesList}
                    </div>
                    <button type="button" class="btn-secondary btn-sm" onclick="addEpisodeField(${season.season_number})">+ Adicionar Episódio</button>
                </div>
            `;
        }
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal modal-lg">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            <h3>Editar Conteúdo</h3>
            <form id="edit-content-form">
                <div class="form-group">
                    <label>Título</label>
                    <input type="text" id="edit-title" value="${item.title || ''}" required>
                </div>
                ${!isSeries ? `
                <div class="form-group">
                    <label>URL do Vídeo</label>
                    <input type="url" id="edit-video" value="${item.video_url || ''}" required>
                </div>
                ` : `
                <div id="series-fields">
                    <div class="form-group">
                        <label>Temporadas e Episódios</label>
                        <div id="seasons-container">${seasonsHtml}</div>
                        <button type="button" class="btn-secondary" onclick="addSeasonField()">+ Adicionar Temporada</button>
                    </div>
                </div>
                `}
                <div class="form-group">
                    <label>Status</label>
                    <select id="edit-active">
                        <option value="true" ${item.is_active ? 'selected' : ''}>Em Cartaz</option>
                        <option value="false" ${!item.is_active ? 'selected' : ''}>Fora de Cartaz</option>
                    </select>
                </div>
                <div id="edit-error" class="login-error" style="display:none"></div>
                <button type="submit" class="btn-primary">Salvar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Funções para adicionar temporada/episódio no modal de edição
    window.addSeasonField = function(seasonNum = null) {
        const container = document.getElementById('seasons-container');
        const seasonIndex = container.children.length + 1;
        const seasonNumValue = seasonNum || seasonIndex;

        const seasonDiv = document.createElement('div');
        seasonDiv.className = 'season-field';
        seasonDiv.dataset.seasonIndex = seasonIndex;
        seasonDiv.innerHTML = `
            <div class="season-header">
                <label>Temporada ${seasonNumValue} (S${seasonNumValue.toString().padStart(2, '0')})</label>
                <button type="button" class="btn-icon btn-danger" onclick="this.closest('.season-field').remove()">×</button>
            </div>
            <div class="episodes-container" id="episodes-container-${seasonIndex}"></div>
            <button type="button" class="btn-secondary btn-sm" onclick="addEpisodeField(${seasonIndex})">+ Adicionar Episódio</button>
        `;
        container.appendChild(seasonDiv);
    };

    window.addEpisodeField = function(seasonIndex, episodeNum = null) {
        const container = document.getElementById(`episodes-container-${seasonIndex}`);
        const episodeIndex = container.children.length + 1;
        const episodeNumValue = episodeNum || episodeIndex;

        const episodeDiv = document.createElement('div');
        episodeDiv.className = 'episode-field';
        episodeDiv.innerHTML = `
            <div class="episode-row">
                <div class="form-group" style="flex:1;">
                    <label>E${episodeNumValue.toString().padStart(2, '0')}</label>
                    <input type="text" class="episode-code" placeholder="S01E01" value="S${seasonIndex.toString().padStart(2, '0')}E${episodeNumValue.toString().padStart(2, '0')}" data-season="${seasonIndex}" data-episode="${episodeNumValue}">
                </div>
                <div class="form-group" style="flex:2;">
                    <label>Título</label>
                    <input type="text" class="episode-title" placeholder="Título do episódio">
                </div>
                <div class="form-group" style="flex:3;">
                    <label>URL do Vídeo</label>
                    <input type="url" class="episode-url" placeholder="https://...">
                </div>
                <button type="button" class="btn-icon btn-danger" onclick="this.closest('.episode-field').remove()" style="margin-top:20px;">×</button>
            </div>
        `;
        container.appendChild(episodeDiv);
    };

    // Funções para deletar temporada/episódio
    window.deleteEpisode = async (episodeId, btn) => {
        if (confirm('Tem certeza que deseja excluir este episódio?')) {
            await adminDeleteEpisode(episodeId);
            btn.closest('.episode-field').remove();
            showToast('Episódio excluído', 'success');
        }
    };

    window.deleteSeason = async (seasonId, btn) => {
        if (confirm('Tem certeza que deseja excluir esta temporada e todos os episódios?')) {
            const { error } = await getSupabase()
                .from('seasons')
                .delete()
                .eq('id', seasonId);
            if (!error) {
                btn.closest('.season-field').remove();
                showToast('Temporada excluída', 'success');
            }
        }
    };

    document.getElementById('edit-content-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('edit-error');

        const updateData = {
            title: document.getElementById('edit-title').value,
            is_active: document.getElementById('edit-active').value === 'true',
            updated_at: new Date().toISOString(),
        };

        if (!isSeries) {
            updateData.video_url = document.getElementById('edit-video').value;
        }

        const { error } = await updateCatalogItem(id, updateData);

        if (error) {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
            return;
        }

        // Atualizar episódios se for série/anime
        if (isSeries) {
            const seasonFields = document.querySelectorAll('.season-field');
            
            for (const seasonField of seasonFields) {
                const seasonId = seasonField.dataset.seasonId;
                const seasonIndex = parseInt(seasonField.dataset.seasonIndex);
                const episodeFields = seasonField.querySelectorAll('.episode-field');
                
                // Se a temporada já existe, atualizar episódios
                if (seasonId) {
                    for (const episodeField of episodeFields) {
                        const episodeCode = episodeField.querySelector('.episode-code').value;
                        const episodeTitle = episodeField.querySelector('.episode-title').value;
                        const episodeUrl = episodeField.querySelector('.episode-url').value;
                        
                        const parsed = parseSeasonEpisode(episodeCode);
                        const episodeNumber = parsed ? parsed.episode : parseInt(episodeField.querySelector('.episode-code').dataset.episode);
                        
                        // Buscar episódio existente pelo número
                        const { data: existingEpisodes } = await fetchEpisodes(seasonId);
                        const existingEpisode = existingEpisodes?.find(ep => ep.episode_number === episodeNumber);
                        
                        if (existingEpisode) {
                            await updateEpisode(existingEpisode.id, {
                                title: episodeTitle || `Episódio ${episodeNumber}`,
                                video_url: episodeUrl,
                            });
                        } else {
                            await createEpisode({
                                season_id: seasonId,
                                catalog_id: id,
                                episode_number: episodeNumber,
                                title: episodeTitle || `Episódio ${episodeNumber}`,
                                description: '',
                                video_url: episodeUrl,
                            });
                        }
                    }
                } else {
                    // Criar nova temporada
                    const { data: seasonData } = await createSeason({
                        catalog_id: id,
                        season_number: seasonIndex,
                        title: `Temporada ${seasonIndex}`,
                    });

                    if (seasonData) {
                        for (const episodeField of episodeFields) {
                            const episodeCode = episodeField.querySelector('.episode-code').value;
                            const episodeTitle = episodeField.querySelector('.episode-title').value;
                            const episodeUrl = episodeField.querySelector('.episode-url').value;
                            
                            if (!episodeUrl) continue;

                            const parsed = parseSeasonEpisode(episodeCode);
                            const episodeNumber = parsed ? parsed.episode : parseInt(episodeField.querySelector('.episode-code').dataset.episode);

                            await createEpisode({
                                season_id: seasonData.id,
                                catalog_id: id,
                                episode_number: episodeNumber,
                                title: episodeTitle || `Episódio ${episodeNumber}`,
                                description: '',
                                video_url: episodeUrl,
                            });
                        }
                    }
                }
            }
        }

        modal.remove();
        showToast('Conteúdo atualizado!', 'success');
        loadAdminSection('content');
    });
}

async function adminDeleteCatalogItem(id) {
    console.log('adminDeleteCatalogItem: excluindo id:', id);

    try {
        const { error } = await deleteCatalogItem(id);
        console.log('adminDeleteCatalogItem: resultado:', error);

        if (error) {
            console.error('adminDeleteCatalogItem: erro Supabase:', error);
            showToast('Erro ao excluir: ' + (error.message || JSON.stringify(error)), 'error');
            return;
        }

        showToast('Título excluído!', 'success');
        loadAdminSection('content');
    } catch (err) {
        console.error('adminDeleteCatalogItem: erro inesperado:', err);
        showToast('Erro inesperado: ' + err.message, 'error');
    }
}

async function adminDeleteEpisode(id) {
    console.log('adminDeleteEpisode: excluindo id:', id);

    try {
        const { error } = await deleteEpisode(id);
        console.log('adminDeleteEpisode: resultado:', error);

        if (error) {
            console.error('adminDeleteEpisode: erro Supabase:', error);
            showToast('Erro ao excluir episódio: ' + (error.message || JSON.stringify(error)), 'error');
            return;
        }

        showToast('Episódio excluído!', 'success');
    } catch (err) {
        console.error('adminDeleteEpisode: erro inesperado:', err);
        showToast('Erro inesperado: ' + err.message, 'error');
    }
}

async function selectTmdbItem(tmdbId, type) {
    const details = await tmdbGetDetails(tmdbId, type);
    if (!details) {
        showToast('Erro ao buscar detalhes no TMDB', 'error');
        return;
    }

    const catalogData = mapTmdbToCatalog(details, type);
    catalogData.video_url = '';

    const { data, error } = await createCatalogItem(catalogData);
    if (error) {
        showToast(error.message, 'error');
        return;
    }

    if (type === 'tv') {
        const seasons = details.seasons || [];
        for (const season of seasons) {
            if (season.season_number === 0) continue;
            const { data: seasonData } = await createSeason({
                catalog_id: data.id,
                season_number: season.season_number,
                title: season.name || `Temporada ${season.season_number}`,
            });
            if (seasonData && season.episodes) {
                for (const ep of season.episodes) {
                    await createEpisode({
                        season_id: seasonData.id,
                        catalog_id: data.id,
                        episode_number: ep.episode_number,
                        title: ep.name || `Episódio ${ep.episode_number}`,
                        description: ep.overview || '',
                    });
                }
            }
        }
    }

    showToast('Conteúdo adicionado! Adicione a fonte de vídeo.', 'success');
    loadAdminSection('content');
}

window.adminDeleteCatalogItem = adminDeleteCatalogItem;
window.adminDeleteEpisode = adminDeleteEpisode;
window.selectTmdbItem = selectTmdbItem;
window.editCatalogItem = editCatalogItem;
window.toggleCatalogActive = toggleCatalogActive;
window.editUserRole = editUserRole;
window.adminUpdateRequestStatus = adminUpdateRequestStatus;
window.showAddContentModal = showAddContentModal;
window.showAddUserModal = showAddUserModal;
