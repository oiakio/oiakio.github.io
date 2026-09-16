// ============================================
// OIAKIÓ - PONTO DE ENTRADA PRINCIPAL
// ============================================

async function renderLogin() {
    const top = document.querySelector('.top');
    if (top) top.style.display = 'none';

    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="login-page">
            <div class="login-left">
                <div class="login-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none"><path d="M18.2892 2.88976C17.2615 2.75159 15.9068 2.75 14 2.75C13.5858 2.75 13.25 2.41421 13.25 2C13.25 1.58579 13.5858 1.25 14 1.25H14.0564C15.8942 1.24998 17.3498 1.24997 18.489 1.40314C19.6615 1.56076 20.6104 1.89288 21.3588 2.64124C22.0432 3.32568 22.417 3.97665 22.5924 4.98199C22.7501 5.88571 22.7501 7.1045 22.75 8.90369L22.75 9C22.75 9.41422 22.4142 9.75 22 9.75C21.5858 9.75 21.25 9.41422 21.25 9C21.25 7.08092 21.2471 5.9986 21.1147 5.23984C20.9973 4.56666 20.7852 4.18904 20.2981 3.7019C19.8749 3.27869 19.2952 3.02503 18.2892 2.88976Z" fill="currentColor"/><path d="M2.75001 15C2.75001 14.5858 2.41422 14.25 2.00001 14.25C1.58579 14.25 1.25001 14.5858 1.25001 15L1.25 15.0963C1.24995 16.8955 1.24992 18.1143 1.40762 19.018C1.58304 20.0233 1.95681 20.6743 2.64125 21.3588C3.38961 22.1071 4.33856 22.4392 5.51098 22.5969C6.6502 22.75 8.10583 22.75 9.94359 22.75H10C10.4142 22.75 10.75 22.4142 10.75 22C10.75 21.5858 10.4142 21.25 10 21.25C8.09318 21.25 6.73852 21.2484 5.71085 21.1102C4.70476 20.975 4.12512 20.7213 3.70191 20.2981C3.21477 19.811 3.00275 19.4333 2.88529 18.7602C2.75289 18.0014 2.75001 16.9191 2.75001 15Z" fill="currentColor"/><path d="M22.75 15C22.75 14.5858 22.4142 14.25 22 14.25C21.5858 14.25 21.25 14.5858 21.25 15C21.25 16.9191 21.2471 18.0014 21.1147 18.7602C20.9973 19.4333 20.7852 19.811 20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25C13.5858 21.25 13.25 21.5858 13.25 22C13.25 22.4142 13.5858 22.75 14 22.75H14.0564C15.8942 22.75 17.3498 22.75 18.489 22.5969C19.6615 22.4392 20.6104 22.1071 21.3588 21.3588C22.0432 20.6743 22.417 20.0233 22.5924 19.018C22.7501 18.1143 22.7501 16.8955 22.75 15.0963L22.75 15Z" fill="currentColor"/><path d="M10 1.25H9.94359C8.10584 1.24998 6.65019 1.24997 5.51098 1.40314C4.33856 1.56076 3.38961 1.89288 2.64125 2.64124C1.95681 3.32568 1.58304 3.97665 1.40762 4.98199C1.24992 5.8857 1.24995 7.10448 1.25 8.90364L1.25001 9C1.25001 9.41422 1.58579 9.75 2.00001 9.75C2.41422 9.75 2.75001 9.41422 2.75001 9C2.75001 7.08092 2.75289 5.9986 2.88529 5.23984C3.00275 4.56666 3.21477 4.18904 3.70191 3.7019C4.12512 3.27869 4.70476 3.02503 5.71085 2.88976C6.73852 2.75159 8.09319 2.75 10 2.75C10.4142 2.75 10.75 2.41421 10.75 2C10.75 1.58579 10.4142 1.25 10 1.25Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12 9.25C10.4812 9.25 9.25001 10.4812 9.25001 12C9.25001 13.5188 10.4812 14.75 12 14.75C13.5188 14.75 14.75 13.5188 14.75 12C14.75 10.4812 13.5188 9.25 12 9.25ZM10.75 12C10.75 11.3096 11.3096 10.75 12 10.75C12.6904 10.75 13.25 11.3096 13.25 12C13.25 12.6904 12.6904 13.25 12 13.25C11.3096 13.25 10.75 12.6904 10.75 12Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.32438 9.45049C6.59435 7.97738 8.77637 6.25 12 6.25C15.2236 6.25 17.4057 7.97738 18.6756 9.45049L18.7079 9.48791C18.9789 9.80202 19.2576 10.125 19.4491 10.5121C19.6632 10.9448 19.75 11.4094 19.75 12C19.75 12.5906 19.6632 13.0552 19.4491 13.4879C19.2576 13.875 18.9789 14.198 18.7079 14.5121L18.6756 14.5495C17.4057 16.0226 15.2236 17.75 12 17.75C8.77637 17.75 6.59435 16.0226 5.32438 14.5495L5.29211 14.5121C5.0211 14.198 4.7424 13.875 4.5509 13.4879C4.33676 13.0552 4.25001 12.5906 4.25001 12C4.25001 11.4094 4.33676 10.9448 4.5509 10.5121C4.74241 10.125 5.02109 9.80202 5.2921 9.48791L5.32438 9.45049ZM12 7.75C9.369 7.75 7.56642 9.14707 6.46048 10.4299C6.14652 10.7941 5.99368 10.9785 5.89533 11.1773C5.81198 11.3457 5.75001 11.566 5.75001 12C5.75001 12.434 5.81198 12.6543 5.89533 12.8227C5.99368 13.0215 6.14652 13.2059 6.46048 13.5701C7.56642 14.8529 9.369 16.25 12 16.25C14.631 16.25 16.4336 14.8529 17.5395 13.5701C17.8535 13.2059 18.0063 13.0215 18.1047 12.8227C18.188 12.6543 18.25 12.434 18.25 12C18.25 11.566 18.188 11.3457 18.1047 11.1773C18.0063 10.9785 17.8535 10.7941 17.5395 10.4299C16.4336 9.14707 14.631 7.75 12 7.75Z" fill="currentColor"/></svg>
                    <h1>OiakiÓ</h1>
                    <p class="login-subtitle"><em>Pega a tua visão</em></p>
                </div>
            </div>
            <div class="login-right">
                <form id="login-form" class="login-form">
                    <h2>Entrar</h2>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <div id="login-error" class="login-error" style="display:none"></div>
                    <button type="submit" class="btn-primary" id="login-btn">Entrar</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.textContent = 'Entrando...';
        errorEl.style.display = 'none';

        const { data, error } = await login(email, password);

        if (error) {
            errorEl.textContent = error.message || 'Email ou senha inválidos';
            errorEl.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Entrar';
            return;
        }

        if (data?.session) {
            navigate('#/home');
        }
    });
}

async function renderHome() {
    const app = document.getElementById('app');
    const user = await fetchCurrentUser();
    if (!user) return;

    app.innerHTML = `
        <div class="page home-page">
            <div class="home-grid">
                <div class="home-column">
                    <div class="home-card" id="latest-section-card" style="display:none">
                        <h2 class="card-title">Últimas Atualizações</h2>
                        <div class="catalog-grid" id="latest-grid"></div>
                    </div>
                </div>
                <div class="home-column">
                    <div class="home-card" id="latest-episodes-section-card" style="display:none">
                        <h2 class="card-title">Novos Episódios</h2>
                        <div class="catalog-grid" id="latest-episodes-grid"></div>
                    </div>
                    <div class="home-card" id="most-favorited-section-card" style="display:none">
                        <h2 class="card-title">Mais Favoritados</h2>
                        <div class="catalog-grid" id="most-favorited-grid"></div>
                    </div>
                    <div class="home-card" id="most-liked-section-card" style="display:none">
                        <h2 class="card-title">Mais Curtidos</h2>
                        <div class="catalog-grid" id="most-liked-grid"></div>
                    </div>
                </div>
                <div class="home-column">
                    <div class="home-card" id="most-watched-section-card" style="display:none">
                        <h2 class="card-title">Mais Assistidos</h2>
                        <div class="catalog-grid" id="most-watched-grid"></div>
                    </div>
                    <div class="home-card" id="most-disliked-section-card" style="display:none">
                        <h2 class="card-title">Mais Não-Gostados</h2>
                        <div class="catalog-grid" id="most-disliked-grid"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Carregar Últimas Atualizações
    const latestCard = document.getElementById('latest-section-card');
    const latestGrid = document.getElementById('latest-grid');
    const { data: latestContent } = await fetchLatestContent(8);
    
    if (latestContent && latestContent.length > 0) {
        latestCard.style.display = '';
        const watchedIds = new Set();
        const favIds = new Set();
        const likeIds = new Set();
        const dislikeIds = new Set();
        const watchlistIds = new Set();
        if (user) {
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
        latestGrid.innerHTML = latestContent.map(item => {
            const watched = watchedIds.has(item.id);
            const favorited = favIds.has(item.id);
            const liked = likeIds.has(item.id);
            const disliked = dislikeIds.has(item.id);
            const watchlisted = watchlistIds.has(item.id);
            const reactionIcon = disliked ? 'dislike' : liked ? 'like' : null;
            const reactionClass = disliked ? 'reaction-badge dislike' : 'reaction-badge';
            const isSeries = item.content_type === 'tv' || item.content_type === 'anime';
            return `
            <div class="content-card" onclick="openDetailModal('${item.id}')">
                <div class="poster-wrapper">
                    <img src="${item.poster || ''}" alt="${item.title || ''}" loading="lazy">
                    ${watched ? `<div class="watched-badge">${getIcon('check', 16)}</div>` : ''}
                    ${favorited ? `<div class="fav-badge">${getIcon('star', 16)}</div>` : ''}
                    ${reactionIcon ? `<div class="${reactionClass}">${getIcon(reactionIcon, 16)}</div>` : ''}
                    ${watchlisted ? `<div class="watchlist-badge">${getIcon('plus', 16)}</div>` : ''}
                </div>
                <div class="content-info">
                    <h4>${item.title || 'Sem título'}</h4>
                    <span class="content-meta">${item.release_year || ''}${isSeries ? ' • Série' : ''}</span>
                </div>
            </div>
        `;
        }).join('');
    }

    // Carregar Novos Episódios
    const latestEpisodesCard = document.getElementById('latest-episodes-section-card');
    const latestEpisodesGrid = document.getElementById('latest-episodes-grid');
    const { data: latestEpisodes } = await fetchLatestEpisodes(8);
    
    if (latestEpisodes && latestEpisodes.length > 0) {
        latestEpisodesCard.style.display = '';
        latestEpisodesGrid.innerHTML = latestEpisodes.map(ep => {
            const seasonNum = ep.season?.season_number || 1;
            const epNum = ep.episode_number || '';
            const epTitle = ep.title || `Episódio ${epNum}`;
            const epCode = `S${seasonNum.toString().padStart(2, '0')}E${epNum.toString().padStart(2, '0')}`;
            return `
            <div class="content-card" onclick="openDetailModal('${ep.catalog_id}')">
                <div class="poster-wrapper">
                    <img src="${ep.catalog?.poster || ''}" alt="${ep.catalog?.title || ''}" loading="lazy">
                    <div class="episode-number">${epCode}</div>
                </div>
                <div class="content-info">
                    <h4>${ep.catalog?.title || ''}</h4>
                    <span class="content-meta">${epTitle}</span>
                </div>
            </div>
        `;
        }).join('');
    }

    // Carregar Mais Assistidos
    const mostWatchedCard = document.getElementById('most-watched-section-card');
    const mostWatchedGrid = document.getElementById('most-watched-grid');
    const { data: mostWatched } = await fetchMostWatched(8);
    
    if (mostWatched && mostWatched.length > 0) {
        mostWatchedCard.style.display = '';
        const watchedIds = new Set();
        const favIds = new Set();
        const likeIds = new Set();
        const dislikeIds = new Set();
        const watchlistIds = new Set();
        if (user) {
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
        mostWatchedGrid.innerHTML = mostWatched.map((item, index) => {
            const watched = watchedIds.has(item.id);
            const favorited = favIds.has(item.id);
            const liked = likeIds.has(item.id);
            const disliked = dislikeIds.has(item.id);
            const watchlisted = watchlistIds.has(item.id);
            const reactionIcon = disliked ? 'dislike' : liked ? 'like' : null;
            const reactionClass = disliked ? 'reaction-badge dislike' : 'reaction-badge';
            const isSeries = item.content_type === 'tv' || item.content_type === 'anime';
            return `
            <div class="content-card" onclick="openDetailModal('${item.id}')">
                <div class="poster-wrapper">
                    <img src="${item.poster || ''}" alt="${item.title || ''}" loading="lazy">
                    ${watched ? `<div class="watched-badge">${getIcon('check', 16)}</div>` : ''}
                    ${favorited ? `<div class="fav-badge">${getIcon('star', 16)}</div>` : ''}
                    ${reactionIcon ? `<div class="${reactionClass}">${getIcon(reactionIcon, 16)}</div>` : ''}
                    ${watchlisted ? `<div class="watchlist-badge">${getIcon('plus', 16)}</div>` : ''}
                </div>
                <div class="content-info">
                    <div class="rank-badge">#${index + 1}</div>
                    <h4>${item.title || 'Sem título'}</h4>
                    <span class="content-meta">${item.release_year || ''}${isSeries ? ' • Série' : ''}</span>
                </div>
            </div>
        `;
        }).join('');
    }

    // Carregar Mais Favoritados
    const mostFavoritedCard = document.getElementById('most-favorited-section-card');
    const mostFavoritedGrid = document.getElementById('most-favorited-grid');
    const { data: mostFavorited } = await fetchMostFavorited(8);
    
    if (mostFavorited && mostFavorited.length > 0) {
        mostFavoritedCard.style.display = '';
        const watchedIds = new Set();
        const favIds = new Set();
        const likeIds = new Set();
        const dislikeIds = new Set();
        const watchlistIds = new Set();
        if (user) {
            const { data: watchedData } = await fetchWatched(user.id);
            watchedData.forEach(w => watchedIds.add(w.catalog_id));
            const { data: favData } = await fetchFavorites(user.id);
            favData.forEach(f => favIds.add(f.catalog_id));
            const { data: likeData } = await fetchLikes(user.id);
            likeData.forEach(l => likeIds.add(l.catalog_id));
            const { data: dislikeData } = await fetchDislikes(user.id);
            dislikeData.forEach(d => dislikeIds.add(d.catalog_id));
            const { data: watchlistData } = await fetchWatchlist(user.id);
            watchlistIds.forEach(w => watchlistIds.add(w.catalog_id));
        }
        mostFavoritedGrid.innerHTML = mostFavorited.map((item, index) => {
            const watched = watchedIds.has(item.id);
            const favorited = favIds.has(item.id);
            const liked = likeIds.has(item.id);
            const disliked = dislikeIds.has(item.id);
            const watchlisted = watchlistIds.has(item.id);
            const reactionIcon = disliked ? 'dislike' : liked ? 'like' : null;
            const reactionClass = disliked ? 'reaction-badge dislike' : 'reaction-badge';
            const isSeries = item.content_type === 'tv' || item.content_type === 'anime';
            return `
            <div class="content-card" onclick="openDetailModal('${item.id}')">
                <div class="poster-wrapper">
                    <img src="${item.poster || ''}" alt="${item.title || ''}" loading="lazy">
                    ${watched ? `<div class="watched-badge">${getIcon('check', 16)}</div>` : ''}
                    ${favorited ? `<div class="fav-badge">${getIcon('star', 16)}</div>` : ''}
                    ${reactionIcon ? `<div class="${reactionClass}">${getIcon(reactionIcon, 16)}</div>` : ''}
                    ${watchlisted ? `<div class="watchlist-badge">${getIcon('plus', 16)}</div>` : ''}
                </div>
                <div class="content-info">
                    <div class="rank-badge">#${index + 1}</div>
                    <h4>${item.title || 'Sem título'}</h4>
                    <span class="content-meta">${item.release_year || ''}${isSeries ? ' • Série' : ''}</span>
                </div>
            </div>
        `;
        }).join('');
    }

    // Carregar Mais Curtidos
    const mostLikedCard = document.getElementById('most-liked-section-card');
    const mostLikedGrid = document.getElementById('most-liked-grid');
    const { data: mostLiked } = await fetchMostLiked(8);
    
    if (mostLiked && mostLiked.length > 0) {
        mostLikedCard.style.display = '';
        const watchedIds = new Set();
        const favIds = new Set();
        const likeIds = new Set();
        const dislikeIds = new Set();
        const watchlistIds = new Set();
        if (user) {
            const { data: watchedData } = await fetchWatched(user.id);
            watchedData.forEach(w => watchedIds.add(w.catalog_id));
            const { data: favData } = await fetchFavorites(user.id);
            favData.forEach(f => favIds.add(f.catalog_id));
            const { data: likeData } = await fetchLikes(user.id);
            likeData.forEach(l => likeIds.add(l.catalog_id));
            const { data: dislikeData } = await fetchDislikes(user.id);
            dislikeData.forEach(d => dislikeIds.add(d.catalog_id));
            const { data: watchlistData } = await fetchWatchlist(user.id);
            watchlistIds.forEach(w => watchlistIds.add(w.catalog_id));
        }
        mostLikedGrid.innerHTML = mostLiked.map((item, index) => {
            const watched = watchedIds.has(item.id);
            const favorited = favIds.has(item.id);
            const liked = likeIds.has(item.id);
            const disliked = dislikeIds.has(item.id);
            const watchlisted = watchlistIds.has(item.id);
            const reactionIcon = disliked ? 'dislike' : liked ? 'like' : null;
            const reactionClass = disliked ? 'reaction-badge dislike' : 'reaction-badge';
            const isSeries = item.content_type === 'tv' || item.content_type === 'anime';
            return `
            <div class="content-card" onclick="openDetailModal('${item.id}')">
                <div class="poster-wrapper">
                    <img src="${item.poster || ''}" alt="${item.title || ''}" loading="lazy">
                    ${watched ? `<div class="watched-badge">${getIcon('check', 16)}</div>` : ''}
                    ${favorited ? `<div class="fav-badge">${getIcon('star', 16)}</div>` : ''}
                    ${reactionIcon ? `<div class="${reactionClass}">${getIcon(reactionIcon, 16)}</div>` : ''}
                    ${watchlisted ? `<div class="watchlist-badge">${getIcon('plus', 16)}</div>` : ''}
                </div>
                <div class="content-info">
                    <div class="rank-badge">#${index + 1}</div>
                    <h4>${item.title || 'Sem título'}</h4>
                    <span class="content-meta">${item.release_year || ''}${isSeries ? ' • Série' : ''}</span>
                </div>
            </div>
        `;
        }).join('');
    }

    // Carregar Mais Não-Gostados
    const mostDislikedCard = document.getElementById('most-disliked-section-card');
    const mostDislikedGrid = document.getElementById('most-disliked-grid');
    const { data: mostDisliked } = await fetchMostDisliked(8);
    
    if (mostDisliked && mostDisliked.length > 0) {
        mostDislikedCard.style.display = '';
        const watchedIds = new Set();
        const favIds = new Set();
        const likeIds = new Set();
        const dislikeIds = new Set();
        const watchlistIds = new Set();
        if (user) {
            const { data: watchedData } = await fetchWatched(user.id);
            watchedData.forEach(w => watchedIds.add(w.catalog_id));
            const { data: favData } = await fetchFavorites(user.id);
            favData.forEach(f => favIds.add(f.catalog_id));
            const { data: likeData } = await fetchLikes(user.id);
            likeData.forEach(l => likeIds.add(l.catalog_id));
            const { data: dislikeData } = await fetchDislikes(user.id);
            dislikeData.forEach(d => dislikeIds.add(d.catalog_id));
            const { data: watchlistData } = await fetchWatchlist(user.id);
            watchlistIds.forEach(w => watchlistIds.add(w.catalog_id));
        }
        mostDislikedGrid.innerHTML = mostDisliked.map((item, index) => {
            const watched = watchedIds.has(item.id);
            const favorited = favIds.has(item.id);
            const liked = likeIds.has(item.id);
            const disliked = dislikeIds.has(item.id);
            const watchlisted = watchlistIds.has(item.id);
            const reactionIcon = disliked ? 'dislike' : liked ? 'like' : null;
            const reactionClass = disliked ? 'reaction-badge dislike' : 'reaction-badge';
            const isSeries = item.content_type === 'tv' || item.content_type === 'anime';
            return `
            <div class="content-card" onclick="openDetailModal('${item.id}')">
                <div class="poster-wrapper">
                    <img src="${item.poster || ''}" alt="${item.title || ''}" loading="lazy">
                    ${watched ? `<div class="watched-badge">${getIcon('check', 16)}</div>` : ''}
                    ${favorited ? `<div class="fav-badge">${getIcon('star', 16)}</div>` : ''}
                    ${reactionIcon ? `<div class="${reactionClass}">${getIcon(reactionIcon, 16)}</div>` : ''}
                    ${watchlisted ? `<div class="watchlist-badge">${getIcon('plus', 16)}</div>` : ''}
                </div>
                <div class="content-info">
                    <div class="rank-badge">#${index + 1}</div>
                    <h4>${item.title || 'Sem título'}</h4>
                    <span class="content-meta">${item.release_year || ''}${isSeries ? ' • Série' : ''}</span>
                </div>
            </div>
        `;
        }).join('');
    }
}

(async function initApp() {
    const db = initSupabase();
    if (!db) {
        console.error('Falha ao inicializar Supabase');
        document.getElementById('app').innerHTML = '<div class="page"><h1>Erro ao carregar aplicação</h1></div>';
        return;
    }

    addRoute('#/login', { auth: false, render: renderLogin });
    addRoute('#/home', { auth: true, render: renderHome });
    addRoute('#/filmes', { auth: true, render: () => renderCatalog('movie') });
    addRoute('#/series', { auth: true, render: () => renderCatalog('tv') });
    addRoute('#/animes', { auth: true, render: () => renderCatalog('anime') });
    addRoute('#/assistir/movie', { auth: true, render: renderMoviePlayer });
    addRoute('#/assistir/episode', { auth: true, render: renderEpisodePlayer });
    addRoute('#/perfil', { auth: true, render: renderOwnProfile });
    addRoute('#/perfil/:id', { auth: true, render: renderPublicProfile });
    addRoute('#/configuracoes', { auth: true, render: renderSettings });
    addRoute('#/pedidos', { auth: true, render: renderRequests });
    addRoute('#/admin', { auth: true, admin: true, render: renderAdmin });

    onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            navigate('#/login');
        } else if (event === 'SIGNED_IN' && window.location.hash === '#/login') {
            await handleRoute();
        }
    });

    initRouter();

    // Habilitar rolagem horizontal com scroll do mouse nos cards da home
    document.addEventListener('wheel', (e) => {
        const target = e.target.closest('.home-card .catalog-grid');
        if (target) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                target.scrollLeft += e.deltaY;
            }
        }
    }, { passive: false });
})();
