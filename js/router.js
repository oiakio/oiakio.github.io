// ============================================
// ROUTER SPA COM HASH
// ============================================

const routes = {};

function addRoute(path, config) {
    routes[path] = config;
}

function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
}

function navigate(path) {
    window.location.hash = path;
}

async function handleRoute() {
    const rawHash = window.location.hash || '';
    const hash = rawHash || '#/login';
    console.log('handleRoute: hash atual:', hash);
    const user = await fetchCurrentUser();
    console.log('handleRoute: usuário:', user?.email || 'não logado');

    const app = document.getElementById('app');
    if (!app) return;

    if (user && hash === '#/login') {
        navigate('#/home');
        return;
    }

    let routeKey = Object.keys(routes).find(key => {
        if (key.includes(':id')) {
            const regex = new RegExp('^' + key.replace(':id', '[^/]+') + '$');
            return regex.test(hash);
        }
        return hash === key;
    });

    if (!routeKey) {
        const parentRoute = Object.keys(routes).find(key => {
            if (key.includes(':id')) return false;
            return hash.startsWith(key + '/');
        });
        if (parentRoute) {
            routeKey = parentRoute;
        }
    }

    console.log('handleRoute: routeKey encontrada:', routeKey);

    if (!routeKey) {
        if (user) {
            navigate('#/home');
        } else {
            navigate('#/login');
        }
        return;
    }

    const route = routes[routeKey];

    if (route.auth && !user) {
        navigate('#/login');
        return;
    }

    if (route.admin) {
        const admin = await isAdmin();
        if (!admin) {
            showToast('Acesso restrito', 'error');
            navigate('#/home');
            return;
        }
    }

    currentRoute = routeKey;
    const top = document.querySelector('.top');
    if (top) top.style.display = '';
    if (app) app.style.paddingTop = '';
    updateNavbar(user);

    try {
        console.log('handleRoute: renderizando rota:', routeKey);
        await route.render(hash);
    } catch (err) {
        console.error('Erro ao renderizar rota:', err);
        app.innerHTML = `<div class="page"><h1>Erro ao carregar página</h1><p>${err.message}</p></div>`;
    }
}

async function updateNavbar(user) {
    const top = document.querySelector('.top');
    if (!top) return;
    const isAuth = !!user;
    top.classList.toggle('authed', isAuth);

    if (!isAuth) {
        const adminContainer = document.getElementById('admin-link-container');
        if (adminContainer) adminContainer.innerHTML = '';
        return;
    }

    const admin = await isAdmin();
    console.log('updateNavbar isAdmin:', admin);
    const adminContainer = document.getElementById('admin-link-container');
    if (adminContainer) {
        if (admin) {
            adminContainer.innerHTML = `
                <a href="#/admin" class="user-links admin-link" aria-label="Admin">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </a>
            `;
        } else {
            adminContainer.innerHTML = '';
        }
    }
}
