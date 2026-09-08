// ============================================
// TMDB API
// ============================================

const TMDB_API_KEY = '24d1a811ce240d63bd2a0f8e082a4704';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';

async function tmdbSearch(query, type = 'multi', page = 1) {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'SUA_CHAVE_TMDB') {
        showToast('Chave TMDB não configurada', 'error');
        return { results: [] };
    }

    const url = `${TMDB_BASE}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=pt-BR`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar no TMDB');
    const data = await res.json();
    return data.results || [];
}

async function tmdbGetDetails(id, type = 'movie') {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'SUA_CHAVE_TMDB') {
        return null;
    }

    const append = 'credits,videos,external_ids';
    const url = `${TMDB_BASE}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=${append}&language=pt-BR`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar detalhes no TMDB');
    return await res.json();
}

function tmdbImageUrl(path, size = 'w500') {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

function mapTmdbToCatalog(tmdbData, type) {
    const isMovie = type === 'movie';
    const isTV = type === 'tv';

    return {
        tmdb_id: tmdbData.id,
        content_type: type === 'tv' ? 'tv' : (type === 'anime' ? 'anime' : 'movie'),
        title: tmdbData.title || tmdbData.name || '',
        original_title: tmdbData.original_title || tmdbData.original_name || '',
        poster: tmdbImageUrl(tmdbData.poster_path, 'w500'),
        backdrop: tmdbImageUrl(tmdbData.backdrop_path, 'original'),
        synopsis: tmdbData.overview || '',
        release_date: tmdbData.release_date || tmdbData.first_air_date || '',
        release_year: extractYear(tmdbData.release_date || tmdbData.first_air_date),
        genres: (tmdbData.genres || []).map(g => g.name),
        cast_members: (tmdbData.credits?.cast || []).slice(0, 10).map(c => c.name),
        directors: (tmdbData.credits?.crew || []).filter(c => c.job === 'Director').map(c => c.name),
        writers: (tmdbData.credits?.crew || []).filter(c => c.job === 'Writer' || c.job === 'Screenplay').map(c => c.name),
        imdb_id: tmdbData.external_ids?.imdb_id || '',
        imdb_rating: tmdbData.vote_average ? parseFloat(tmdbData.vote_average.toFixed(1)) : null,
        is_active: true,
        updated_at: new Date().toISOString(),
    };
}

function extractYear(dateStr) {
    if (!dateStr) return null;
    return parseInt(dateStr.split('-')[0]);
}
