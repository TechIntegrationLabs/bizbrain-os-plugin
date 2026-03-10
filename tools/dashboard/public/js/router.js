// === BizBrain OS Dashboard — Hash Router ===

const Router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  start() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const content = document.getElementById('content');

    // Match exact routes first
    if (this.routes[hash]) {
      this.currentRoute = hash;
      this.routes[hash](content);
      this.updateNav(hash);
      return;
    }

    // Match parameterized routes (e.g., /setup/:id)
    for (const [pattern, handler] of Object.entries(this.routes)) {
      if (pattern.includes(':')) {
        const regex = new RegExp('^' + pattern.replace(/:([^/]+)/g, '([^/]+)') + '$');
        const match = hash.match(regex);
        if (match) {
          this.currentRoute = hash;
          handler(content, ...match.slice(1));
          this.updateNav(pattern.split('/')[1] || 'home');
          return;
        }
      }
    }

    // Default to home
    this.currentRoute = '/';
    if (this.routes['/']) this.routes['/'](content);
    this.updateNav('/');
  },

  updateNav(route) {
    const baseRoute = route.split('/')[1] || 'home';
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemRoute = item.dataset.route;
      item.classList.toggle('active', itemRoute === baseRoute || (itemRoute === 'setup' && baseRoute === 'setup'));
    });
  },
};
