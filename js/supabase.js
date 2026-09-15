// ============================================
// SUPABASE CLIENTE E FUNÇÕES AUXILIARES
// ============================================

const SUPABASE_URL = 'https://xuogmtlcbhnmbneiysqt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1b2dtdGxjYmhubWJuZWl5c3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MzYzNTUsImV4cCI6MjEwNDMxMjM1NX0.L3EfeZydi3HfP6DzaOlDR2QbYyR5gqQogifG8XYIZMk';

let supabaseClient = null;

function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase não carregado. Verifique o CDN no index.html');
        return null;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
}

function getSupabase() {
    return supabaseClient;
}

// ============================================
// CATÁLOGO
// ============================================

async function fetchCatalog(type = null, filters = {}) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };

    let query = db
        .from('catalog')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (type) {
        query = query.eq('content_type', type);
    }

    if (filters.genre) {
        query = query.contains('genres', [filters.genre]);
    }
    if (filters.year) {
        query = query.eq('release_year', filters.year);
    }
    if (filters.rating) {
        const minRating = parseInt(filters.rating) * 2;
        query = query.gte('imdb_rating', minRating);
    }
    if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,original_title.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    return { data: data || [], error };
}

async function fetchCatalogById(id) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('catalog').select('*').eq('id', id).single();
    console.log('fetchCatalogById resultado:', { data, error });
    return { data, error };
}

async function fetchCatalogByTmdbId(tmdbId, type) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('catalog')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .eq('content_type', type)
        .single();
    return { data, error };
}

async function createCatalogItem(item) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('catalog').insert([item]).select().single();
    return { data, error };
}

async function updateCatalogItem(id, updates) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('catalog').update(updates).eq('id', id).select().single();
    return { data, error };
}

async function deleteCatalogItem(id) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.from('catalog').delete().eq('id', id);
    return { error };
}

// ============================================
// TEMPORADAS E EPISÓDIOS
// ============================================

async function fetchSeasons(catalogId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('seasons')
        .select('*')
        .eq('catalog_id', catalogId)
        .order('season_number', { ascending: true });
    return { data: data || [], error };
}

async function fetchEpisodes(seasonId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .order('episode_number', { ascending: true });
    return { data: data || [], error };
}

async function fetchEpisodeById(id) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('episodes').select('*').eq('id', id).single();
    console.log('fetchEpisodeById resultado:', { data, error });
    return { data, error };
}

async function createSeason(season) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('seasons').insert([season]).select().single();
    return { data, error };
}

async function updateSeason(id, updates) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('seasons').update(updates).eq('id', id).select().single();
    return { data, error };
}

async function deleteSeason(id) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.from('seasons').delete().eq('id', id);
    return { error };
}

async function createEpisode(episode) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('episodes').insert([episode]).select().single();
    return { data, error };
}

async function updateEpisode(id, updates) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('episodes').update(updates).eq('id', id).select().single();
    return { data, error };
}

async function deleteEpisode(id) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.from('episodes').delete().eq('id', id);
    return { error };
}

// ============================================
// FAVORITOS E QUERO VER
// ============================================

async function fetchFavorites(userId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('favorites')
        .select('catalog_id, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

async function toggleFavorite(userId, catalogId) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };

    try {
        const { data: existing } = await db
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId)
            .single();

        if (existing) {
            const { error } = await db.from('favorites').delete().eq('id', existing.id);
            return { favorited: false, error };
        }

        const { error } = await db.from('favorites').insert([{ user_id: userId, catalog_id: catalogId }]);
        return { favorited: true, error };
    } catch (err) {
        console.error('toggleFavorite erro:', err);
        return { favorited: false, error: err };
    }
}

async function isFavorited(userId, catalogId) {
    const db = getSupabase();
    if (!db) return false;
    try {
        const { data, error } = await db
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId)
            .single();
        if (error) {
            console.warn('isFavorited erro:', error);
            return false;
        }
        return !!data;
    } catch (err) {
        console.warn('isFavorited exceção:', err);
        return false;
    }
}

async function fetchWatchlist(userId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('watchlist')
        .select('catalog_id, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

async function fetchDislikes(userId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('dislikes')
        .select('catalog_id, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

async function toggleWatchlist(userId, catalogId) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };

    try {
        const { data: existing } = await db
            .from('watchlist')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId)
            .single();

        if (existing) {
            const { error } = await db.from('watchlist').delete().eq('id', existing.id);
            return { watchlisted: false, error };
        }

        const { error } = await db.from('watchlist').insert([{ user_id: userId, catalog_id: catalogId }]);
        return { watchlisted: true, error };
    } catch (err) {
        console.error('toggleWatchlist erro:', err);
        return { watchlisted: false, error: err };
    }
}

async function isWatchlisted(userId, catalogId) {
    const db = getSupabase();
    if (!db) return false;
    try {
        const { data, error } = await db
            .from('watchlist')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId)
            .single();
        if (error) {
            console.warn('isWatchlisted erro:', error);
            return false;
        }
        return !!data;
    } catch (err) {
        console.warn('isWatchlisted exceção:', err);
        return false;
    }
}

// ============================================
// PROGRESSO E HISTÓRICO
// ============================================

async function fetchWatchProgress(userId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('watch_progress')
        .select('*, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active), episode(*)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
    return { data: data || [], error };
}

async function saveWatchProgress(userId, catalogId, currentTime, duration, episodeId = null) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };

    const { data: existing } = await db
        .from('watch_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('catalog_id', catalogId)
        .eq('episode_id', episodeId)
        .single();

    const progress = {
        user_id: userId,
        catalog_id: catalogId,
        current_time_seconds: currentTime,
        duration_seconds: duration,
        updated_at: new Date().toISOString(),
    };

    if (episodeId) {
        progress.episode_id = episodeId;
    }

    if (existing) {
        const { error } = await db.from('watch_progress').update(progress).eq('id', existing.id);
        return { error };
    }

    const { error } = await db.from('watch_progress').insert([progress]);
    return { error };
}

async function clearWatchProgress(userId, catalogId, episodeId = null) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };

    let query = db.from('watch_progress').delete().eq('user_id', userId).eq('catalog_id', catalogId);
    if (episodeId) {
        query = query.eq('episode_id', episodeId);
    }
    const { error } = await query;
    return { error };
}

async function addToWatchHistory(userId, catalogId, episodeId = null) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };

    const { error } = await db.from('watch_history').insert([{
        user_id: userId,
        catalog_id: catalogId,
        episode_id: episodeId,
        watched_at: new Date().toISOString(),
    }]);
    return { error };
}

async function fetchWatchHistory(userId, limit = 50) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('watch_history')
        .select('*, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active), episode(*)')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })
        .limit(limit);
    return { data: data || [], error };
}

// ============================================
// PERFIS
// ============================================

async function fetchProfile(userId) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

async function updateProfile(userId, updates) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}

async function fetchAllUsers() {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('profiles')
        .select('id, name, location, avatar_url, role, created_at')
        .order('name', { ascending: true });
    return { data: data || [], error };
}

// ============================================
// PEDIDOS
// ============================================

async function fetchRequests(userId = null) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };

    let query = db.from('requests').select('*').order('created_at', { ascending: false });

    if (userId && !await isAdmin()) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    return { data: data || [], error };
}

async function createRequest(request) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.from('requests').insert([request]).select().single();
    return { data, error };
}

async function updateRequestStatus(id, status) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

// ============================================
// ADMIN
// ============================================

async function isAdmin() {
    const user = await fetchCurrentUser();
    if (!user) {
        console.log('isAdmin: no user');
        return false;
    }

    const db = getSupabase();
    if (!db) {
        console.log('isAdmin: no db');
        return false;
    }

    try {
        const { data } = await db
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('isAdmin profile result:', data?.role);
        if (data?.role === 'admin') return true;
    } catch (err) {
        console.warn('Erro ao verificar admin via profiles:', err.message);
    }

    if (user.user_metadata?.role === 'admin') {
        console.log('isAdmin metadata result: admin');
        return true;
    }

    console.log('isAdmin final result: false');
    return false;
}

async function fetchAllCatalog() {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('catalog')
        .select('*')
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

// ============================================
// RANKINGS
// ============================================

async function fetchMostWatched(limit = 10, type = null) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };

    const { data, error } = await db.rpc('get_most_watched', {
        p_content_type: type,
        p_limit: limit
    });

    return { data: data || [], error };
}

async function fetchMostFavorited(limit = 10, type = null) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };

    const { data, error } = await db.rpc('get_most_favorited', {
        p_content_type: type,
        p_limit: limit
    });

    return { data: data || [], error };
}

async function fetchMostLiked(limit = 10, type = null) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };

    const { data, error } = await db.rpc('get_most_liked', {
        p_content_type: type,
        p_limit: limit
    });

    return { data: data || [], error };
}

async function fetchMostDisliked(limit = 10, type = null) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };

    const { data, error } = await db.rpc('get_most_disliked', {
        p_content_type: type,
        p_limit: limit
    });

    return { data: data || [], error };
}

async function fetchLatestContent(limit = 10) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    
    const { data, error } = await db
        .from('catalog')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);
    
    return { data: data || [], error };
}

async function fetchLatestEpisodes(limit = 10) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    
    const { data, error } = await db
        .from('episodes')
        .select('*, catalog!inner(title, poster, content_type), season(season_number)')
        .order('created_at', { ascending: false })
        .limit(limit);
    
    return { data: data || [], error };
}

// ============================================
// VISTOS
// ============================================

async function fetchWatched(userId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('watched')
        .select('catalog_id, episode_id, watched_at, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active)')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false });
    
    // Buscar episódios e temporadas separadamente para evitar erro no join
    if (data && data.length > 0) {
        const episodeIds = data.filter(w => w.episode_id).map(w => w.episode_id);
        if (episodeIds.length > 0) {
            let query = db
                .from('episodes')
                .select('*');
            
            if (episodeIds.length === 1) {
                query = query.eq('id', episodeIds[0]);
            } else {
                query = query.in('id', episodeIds);
            }
            
            const { data: episodes, error: epError } = await query;
            
            if (epError) {
                console.error('Erro ao buscar episódios:', epError);
            } else if (episodes && episodes.length > 0) {
                // Buscar temporadas para obter season_number
                const seasonIds = [...new Set(episodes.map(ep => ep.season_id))];
                let seasonQuery = db.from('seasons').select('*');
                
                if (seasonIds.length === 1) {
                    seasonQuery = seasonQuery.eq('id', seasonIds[0]);
                } else {
                    seasonQuery = seasonQuery.in('id', seasonIds);
                }
                
                const { data: seasons } = await seasonQuery;
                
                // Mapear temporadas por ID
                const seasonMap = {};
                (seasons || []).forEach(s => {
                    seasonMap[s.id] = s;
                });
                
                // Mapear episódios por ID com dados da temporada
                const episodeMap = {};
                episodes.forEach(ep => {
                    episodeMap[ep.id] = {
                        ...ep,
                        season: seasonMap[ep.season_id] || null
                    };
                });
                
                // Adicionar dados do episódio aos resultados
                data.forEach(w => {
                    if (w.episode_id && episodeMap[w.episode_id]) {
                        w.episode = episodeMap[w.episode_id];
                    }
                });
            }
        }
    }
    
    return { data: data || [], error };
}

async function isWatched(userId, catalogId, episodeId = null) {
    const db = getSupabase();
    if (!db) return false;
    try {
        let query = db
            .from('watched')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId);

        if (episodeId) {
            query = query.eq('episode_id', episodeId);
        } else {
            query = query.is('episode_id', null);
        }

        const { data, error } = await query;
        console.log('isWatched debug:', { userId, catalogId, episodeId, data, error });
        if (error) return false;
        return data && data.length > 0;
    } catch (err) {
        console.warn('isWatched exceção:', err);
        return false;
    }
}

async function markAsWatched(userId, catalogId, episodeId = null) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.from('watched').insert([{
        user_id: userId,
        catalog_id: catalogId,
        episode_id: episodeId,
    }]);
    return { error };
}

async function unmarkAsWatched(userId, catalogId, episodeId = null) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.from('watched').delete().eq('user_id', userId).eq('catalog_id', catalogId).eq('episode_id', episodeId);
    return { error };
}

async function toggleWatched(userId, catalogId, episodeId = null) {
    const db = getSupabase();
    if (!db) return { watched: false, error: 'Supabase não inicializado' };

    console.log('toggleWatched chamado com:', { userId, catalogId, episodeId });

    // Verificar se já existe
    let query = db
        .from('watched')
        .select('id')
        .eq('user_id', userId)
        .eq('catalog_id', catalogId);

    if (episodeId) {
        query = query.eq('episode_id', episodeId);
    } else {
        query = query.is('episode_id', null);
    }

    const { data: existing, error: fetchError } = await query;

    if (fetchError) {
        console.warn('toggleWatched erro ao verificar existência:', fetchError);
    }

    console.log('toggleWatched: registros existentes:', existing);

    const hasExisting = existing && existing.length > 0;

    if (hasExisting) {
        // Deletar existente
        const ids = existing.map(row => row.id);
        console.log('toggleWatched: deletando registros:', ids);
        const { error } = await db.from('watched').delete().in('id', ids);
        if (error) {
            console.warn('toggleWatched erro ao deletar:', error);
            return { watched: false, error };
        }
        console.log('toggleWatched: deletado com sucesso');
        return { watched: false, error: null };
    }

    // Inserir novo
    console.log('toggleWatched: inserindo novo registro');
    const { error: insertError } = await db.from('watched').insert([{ 
        user_id: userId, 
        catalog_id: catalogId, 
        episode_id: episodeId
    }]);
    
    if (insertError) {
        console.warn('toggleWatched erro ao inserir:', insertError);
        return { watched: false, error: insertError };
    }
    
    console.log('toggleWatched: inserido com sucesso');
    return { watched: true, error: null };
}

// ============================================
// DISLIKES
// ============================================

async function isDisliked(userId, catalogId) {
    const db = getSupabase();
    if (!db) return false;
    try {
        const { data, error } = await db
            .from('dislikes')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId)
            .single();
        if (error) return false;
        return !!data;
    } catch (err) {
        console.warn('isDisliked exceção:', err);
        return false;
    }
}

async function toggleDislike(userId, catalogId) {
    const db = getSupabase();
    if (!db) return { disliked: false, error: 'Supabase não inicializado' };

    const { data: existing } = await db
        .from('dislikes')
        .select('id')
        .eq('user_id', userId)
        .eq('catalog_id', catalogId)
        .single();

    if (existing) {
        const { error } = await db.from('dislikes').delete().eq('id', existing.id);
        return { disliked: false, error };
    }

    const { error } = await db.from('dislikes').insert([{ user_id: userId, catalog_id: catalogId }]);
    return { disliked: true, error };
}

// ============================================
// LIKES
// ============================================

async function isLiked(userId, catalogId) {
    const db = getSupabase();
    if (!db) return false;
    try {
        const { data, error } = await db
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('catalog_id', catalogId)
            .single();
        if (error) return false;
        return !!data;
    } catch (err) {
        console.warn('isLiked exceção:', err);
        return false;
    }
}

async function toggleLike(userId, catalogId) {
    const db = getSupabase();
    if (!db) return { liked: false, error: 'Supabase não inicializado' };

    const { data: existing } = await db
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('catalog_id', catalogId)
        .single();

    if (existing) {
        const { error } = await db.from('likes').delete().eq('id', existing.id);
        return { liked: false, error };
    }

    const { error } = await db.from('likes').insert([{ user_id: userId, catalog_id: catalogId }]);
    return { liked: true, error };
}

async function fetchLikes(userId) {
    const db = getSupabase();
    if (!db) return { data: [], error: 'Supabase não inicializado' };
    const { data, error } = await db
        .from('likes')
        .select('catalog_id, catalog(content_type, title, poster, release_year, synopsis, genres, directors, writers, cast_members, is_active)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data: data || [], error };
}

// ============================================
// SESSÃO
// ============================================

async function getCurrentSession() {
    const db = getSupabase();
    if (!db) return null;
    const { data: { session } } = await db.auth.getSession();
    return session;
}

async function fetchCurrentUser() {
    const db = getSupabase();
    if (!db) return null;
    try {
        const { data } = await db.auth.getUser();
        return data?.user || null;
    } catch (err) {
        console.warn('Erro ao buscar usuário:', err.message);
        return null;
    }
}

// ============================================
// HELPERS
// ============================================

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
