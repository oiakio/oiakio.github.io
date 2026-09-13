// ============================================
// PLAYER DE VÍDEO
// ============================================

let hlsInstance = null;

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

function initPlayer(videoEl, src) {
    console.log('initPlayer: src:', src);
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    if (!src) {
        console.warn('initPlayer: src vazio');
        return;
    }

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
        console.log('initPlayer: usando HLS.js');
        try {
            hlsInstance = new Hls({
                enableWorker: false,
                lowLatencyMode: false,
                maxBufferLength: 30
            });

            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(videoEl);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('initPlayer: MANIFEST_PARSED');
                videoEl.play().catch(e => console.warn('Autoplay bloqueado:', e));
            });

            hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                console.log('initPlayer:LEVEL_SWITCHED', data.level);
            });

            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                console.error('initPlayer: erro HLS:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('initPlayer: erro de rede, tentando recuperar...');
                            hlsInstance.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn('initPlayer: erro de mídia, tentando recuperar...');
                            hlsInstance.recoverMediaError();
                            break;
                        default:
                            console.warn('initPlayer: erro fatal, usando fallback nativo');
                            videoEl.src = src;
                            videoEl.play().catch(e => console.warn('Fallback play bloqueado:', e));
                            break;
                    }
                }
            });
        } catch (e) {
            console.error('initPlayer: exceção ao criar HLS.js:', e);
            videoEl.src = src;
            videoEl.play().catch(() => {});
        }
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('initPlayer: usando suporte nativo HLS');
        videoEl.src = src;
        videoEl.play().catch(e => console.warn('Autoplay bloqueado:', e));
    } else {
        console.log('initPlayer: usando src direto (MP4 ou fallback)');
        videoEl.src = src;
        videoEl.play().catch(e => console.warn('Autoplay bloqueado:', e));
    }
}

async function renderMoviePlayer() {
    const hash = window.location.hash;
    const id = hash.split('/')[3];
    console.log('renderMoviePlayer: id do conteúdo:', id);

    const app = document.getElementById('app');
    app.innerHTML = '<div class="player-container"><div class="loading-spinner"></div></div>';

    const { data: item } = await fetchCatalogById(id);
    console.log('renderMoviePlayer: item encontrado:', item);
    if (!item) {
        app.innerHTML = '<div class="page"><p>Conteúdo não encontrado.</p></div>';
        return;
    }

    const user = await fetchCurrentUser();
    console.log('renderMoviePlayer: usuário logado:', user);
    if (!user) return;

    const videoUrl = item.video_url || '';
    if (isDTubeUrl(videoUrl)) {
        const embedUrl = getDTubeEmbedUrl(videoUrl);
        const watchedState = user ? await isWatched(user.id, item.id) : false;
        app.innerHTML = `
            <div class="player-container">
                <div class="player-header">
                    <button class="btn-back" onclick="history.back()">${getIcon('back', 24)}</button>
                    <h2>${item.title}</h2>
                    ${user ? `<button class="btn-watched ${watchedState ? 'active' : ''}" id="player-watched-btn-${item.id}" onclick="window.togglePlayerWatched('${item.id}')">${getIcon('check', 20)}</button>` : ''}
                </div>
                <iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;flex:1;"></iframe>
            </div>
        `;
        return;
    }

    app.innerHTML = `
        <div class="player-container">
            <div class="player-header">
                <button class="btn-back" onclick="history.back()">${getIcon('back', 24)}</button>
                <h2>${item.title}</h2>
                <a href="${videoUrl}" target="_blank" rel="noopener" class="btn-primary" style="margin-left:auto">Abrir vídeo</a>
                ${user ? `<button class="btn-watched" id="player-watched-btn-${item.id}" onclick="window.togglePlayerWatched('${item.id}')">${getIcon('check', 20)}</button>` : ''}
            </div>
            <video id="main-player" controls autoplay playsinline></video>
            <div id="player-fallback"></div>
        </div>
    `;

    const video = document.getElementById('main-player');
    const fallbackContainer = document.getElementById('player-fallback');
    console.log('renderMoviePlayer: video_url do item:', videoUrl);
    if (videoUrl) {
        initPlayer(video, videoUrl);
        setTimeout(() => {
            if (video.readyState === 0 && !video.error) {
                if (fallbackContainer) {
                    fallbackContainer.innerHTML = `
                        <div class="video-error">
                            <p>O player não conseguiu carregar o vídeo.</p>
                            <a href="${videoUrl}" target="_blank" rel="noopener" class="btn-primary">Abrir vídeo em nova aba</a>
                            <p class="video-hint">Se não abrir, copie a URL e cole no VLC ou outro player.</p>
                        </div>
                    `;
                }
            }
        }, 8000);
    } else {
        console.warn('renderMoviePlayer: item sem video_url');
        if (fallbackContainer) {
            fallbackContainer.innerHTML = '<p class="video-error">Este conteúdo não possui vídeo cadastrado.</p>';
        }
    }

    if (user) {
        const watched = await isWatched(user.id, item.id);
        const btn = document.getElementById(`player-watched-btn-${item.id}`);
        if (btn) btn.classList.toggle('active', watched);
    }

    setupPlayerProgress(video, user.id, item.id, null, async () => {
        await addToWatchHistory(user.id, item.id);
        await clearWatchProgress(user.id, item.id);
    });
}

async function renderEpisodePlayer() {
    const hash = window.location.hash;
    const id = hash.split('/')[3];
    console.log('renderEpisodePlayer: id do episódio:', id);

    const app = document.getElementById('app');
    app.innerHTML = '<div class="player-container"><div class="loading-spinner"></div></div>';

    const { data: episode } = await fetchEpisodeById(id);
    console.log('renderEpisodePlayer: episódio encontrado:', episode);
    if (!episode) {
        app.innerHTML = '<div class="page"><p>Episódio não encontrado.</p></div>';
        return;
    }

    const { data: season } = await getSupabase().from('seasons').select('*, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active)').eq('id', episode.season_id).single();
    console.log('renderEpisodePlayer: season encontrada:', season);
    const user = await fetchCurrentUser();
    console.log('renderEpisodePlayer: usuário logado:', user);
    if (!user) return;

    const { data: episodes } = await fetchEpisodes(episode.season_id);
    const currentIndex = episodes.findIndex(ep => ep.id === episode.id);
    const nextEpisode = episodes[currentIndex + 1] || null;
    const catalogId = episode.catalog_id;

    const videoUrl = episode.video_url || '';
    if (isDTubeUrl(videoUrl)) {
        const embedUrl = getDTubeEmbedUrl(videoUrl);
        const watchedState = user ? await isWatched(user.id, episode.catalog_id, episode.id) : false;
        app.innerHTML = `
            <div class="player-container">
                <div class="player-header">
                    <button class="btn-back" onclick="history.back()">${getIcon('back', 24)}</button>
                    <h2>${season?.catalog?.title || ''} - ${episode.title}</h2>
                    ${user ? `<button class="btn-watched ${watchedState ? 'active' : ''}" id="player-watched-btn-${episode.id}" onclick="window.togglePlayerWatched('${episode.catalog_id}', '${episode.id}')">${getIcon('check', 20)}</button>` : ''}
                </div>
                <iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen style="width:100%;height:100%;border:0;flex:1;"></iframe>
                <div class="player-controls">
                    ${nextEpisode ? `<button class="btn-primary" id="next-ep-btn">Próximo Episódio</button>` : ''}
                </div>
            </div>
        `;
        document.getElementById('next-ep-btn')?.addEventListener('click', () => {
            if (nextEpisode) {
                navigate(`#/assistir/episode/${nextEpisode.id}`);
            }
        });
        return;
    }

    app.innerHTML = `
        <div class="player-container">
            <div class="player-header">
                <button class="btn-back" onclick="history.back()">${getIcon('back', 24)}</button>
                <h2>${season?.catalog?.title || ''} - ${episode.title}</h2>
                ${user ? `<button class="btn-watched" id="player-watched-btn-${episode.id}" onclick="window.togglePlayerWatched('${episode.catalog_id}', '${episode.id}')">${getIcon('check', 20)}</button>` : ''}
            </div>
            <video id="main-player" controls autoplay playsinline></video>
            <div id="player-fallback"></div>
            <div class="player-controls">
                ${nextEpisode ? `<button class="btn-primary" id="next-ep-btn">Próximo Episódio</button>` : ''}
            </div>
            <div class="episodes-list-section">
                <h3>Episódios</h3>
                <div class="episodes-list" id="episodes-list"></div>
            </div>
        </div>
    `;

    const video = document.getElementById('main-player');
    const fallbackContainer = document.getElementById('player-fallback');
    const episodesList = document.getElementById('episodes-list');
    console.log('renderEpisodePlayer: video_url do episódio:', videoUrl);
    
    // Preencher lista de episódios
    if (episodesList && episodes) {
        const watchedStates = {};
        if (user) {
            for (const ep of episodes) {
                const watched = await isWatched(user.id, episode.catalog_id, ep.id);
                watchedStates[ep.id] = watched;
            }
        }
        
        episodesList.innerHTML = episodes.map(ep => {
            const isCurrent = ep.id === episode.id;
            const epCode = `S${season?.season_number || 1}E${ep.episode_number}`;
            const isWatched = watchedStates[ep.id] || false;
            return `
                <div class="episode-item ${isCurrent ? 'current' : ''}" data-episode-id="${ep.id}">
                    <div class="episode-info">
                        <span class="episode-code">${epCode}</span>
                        <span class="episode-title">${ep.title || `Episódio ${ep.episode_number}`}</span>
                    </div>
                    <div class="episode-actions">
                        <button class="btn-play-ep" onclick="navigate('#/assistir/episode/${ep.id}')" ${isCurrent ? 'disabled' : ''}>
                            ${getIcon('play', 16)}
                        </button>
                        ${user ? `
                            <button class="btn-watched-ep ${isWatched ? 'active' : ''}" onclick="window.toggleEpisodeWatched('${catalogId}', '${ep.id}')">
                                ${getIcon('check', 16)}
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    if (videoUrl) {
        initPlayer(video, videoUrl);
        setTimeout(() => {
            if (video.readyState === 0 && !video.error) {
                if (fallbackContainer) {
                    fallbackContainer.innerHTML = `
                        <div class="video-error">
                            <p>O player não conseguiu carregar o vídeo.</p>
                            <a href="${videoUrl}" target="_blank" rel="noopener" class="btn-primary">Abrir vídeo em nova aba</a>
                            <p class="video-hint">Se não abrir, copie a URL e cole no VLC ou outro player.</p>
                        </div>
                    `;
                }
            }
        }, 8000);
    } else {
        console.warn('renderEpisodePlayer: episódio sem video_url');
        if (fallbackContainer) {
            fallbackContainer.innerHTML = '<p class="video-error">Este episódio não possui vídeo cadastrado.</p>';
        }
    }

    if (user) {
        const watched = await isWatched(user.id, episode.catalog_id, episode.id);
        const btn = document.getElementById(`player-watched-btn-${episode.id}`);
        if (btn) btn.classList.toggle('active', watched);
    }

    setupPlayerProgress(video, user.id, episode.catalog_id, episode.id, async () => {
        await addToWatchHistory(user.id, episode.catalog_id, episode.id);
        await clearWatchProgress(user.id, episode.catalog_id, episode.id);
    });

    document.getElementById('next-ep-btn')?.addEventListener('click', () => {
        if (nextEpisode) {
            navigate(`#/assistir/episode/${nextEpisode.id}`);
        }
    });
}

function setupPlayerProgress(video, userId, catalogId, episodeId, onComplete) {
    let lastSave = 0;
    const SAVE_INTERVAL = 15;

    video.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (now - lastSave > SAVE_INTERVAL * 1000) {
            lastSave = now;
            saveWatchProgress(userId, catalogId, video.currentTime, video.duration || 1, episodeId);
        }
    });

    video.addEventListener('pause', () => {
        saveWatchProgress(userId, catalogId, video.currentTime, video.duration || 1, episodeId);
    });

    video.addEventListener('ended', () => {
        onComplete?.();
        saveWatchProgress(userId, catalogId, video.duration || 1, video.duration || 1, episodeId);
    });
}

window.togglePlayerWatched = async function(catalogId, episodeId = null) {
    const user = await fetchCurrentUser();
    if (!user) return;
    const { watched } = await toggleWatched(user.id, catalogId, episodeId);
    const btnId = episodeId ? `player-watched-btn-${episodeId}` : `player-watched-btn-${catalogId}`;
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.classList.toggle('active', watched);
    }
};

window.toggleEpisodeWatched = async function(catalogId, episodeId) {
    console.log('toggleEpisodeWatched chamado:', { catalogId, episodeId });
    const user = await fetchCurrentUser();
    if (!user) {
        console.warn('toggleEpisodeWatched: usuário não encontrado');
        return;
    }
    console.log('toggleEpisodeWatched: usuário encontrado:', user.id);
    const result = await toggleWatched(user.id, catalogId, episodeId);
    console.log('toggleEpisodeWatched: resultado toggleWatched:', result);
    const { watched } = result;
    const btn = document.querySelector(`.episode-item[data-episode-id="${episodeId}"] .btn-watched-ep`);
    if (btn) {
        btn.classList.toggle('active', watched);
        console.log('toggleEpisodeWatched: botão atualizado:', watched);
    }
};
