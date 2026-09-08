// ============================================
// AUTENTICAÇÃO SUPABASE
// ============================================

async function login(email, password) {
    const db = getSupabase();
    if (!db) return { data: null, error: 'Supabase não inicializado' };
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    return { data, error };
}

async function logout() {
    const db = getSupabase();
    if (!db) return;
    await db.auth.signOut();
    navigate('#/login');
}

async function getSession() {
    const db = getSupabase();
    if (!db) return null;
    const { data: { session } } = await db.auth.getSession();
    return session;
}

async function refreshSession() {
    const db = getSupabase();
    if (!db) return null;
    const { data: { session } } = await db.auth.refreshSession();
    return session;
}

function onAuthStateChange(callback) {
    const db = getSupabase();
    if (!db) return { data: { subscription: { unsubscribe: () => {} } } };
    return db.auth.onAuthStateChange(callback);
}

async function updatePassword(newPassword) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.auth.updateUser({ password: newPassword });
    return { error };
}

async function updateEmail(newEmail) {
    const db = getSupabase();
    if (!db) return { error: 'Supabase não inicializado' };
    const { error } = await db.auth.updateUser({ email: newEmail });
    return { error };
}
