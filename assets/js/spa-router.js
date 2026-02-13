/**
 * SPA Router for Unknown Novel
 * Handles client-side routing and dynamic content loading
 */

(function () {
    'use strict';

    const router = {
        routes: {},
        currentPage: null,
        pageOrder: ['/', '/explore', '/library', '/profile'], // Navigation order for direction detection

        // Route configuration
        init() {
            // Define routes mapping URL paths to content pages
            this.routes = {
                '/': {
                    template: 'pages/home.html',
                    title: 'Unknown Novel - Baca Web Novel Gratis',
                    description: 'Baca web novel terbaru dan terpopuler dari berbagai genre secara gratis di Unknown Novel.',
                    init: 'initHomePage'
                },
                '/explore': {
                    template: 'pages/explore.html',
                    title: 'Explore - Unknown Novel',
                    description: 'Jelajahi novel berdasarkan genre favoritmu di Unknown Novel.',
                    init: 'initExplorePage'
                },
                '/novel': {
                    template: 'pages/novel.html',
                    title: 'Novel - Unknown Novel',
                    description: 'Detail novel di Unknown Novel',
                    init: 'initNovelPage'
                },
                '/read': {
                    template: 'pages/read.html',
                    title: 'Baca - Unknown Novel',
                    description: 'Baca chapter novel di Unknown Novel',
                    init: 'initReadPage'
                },
                '/library': {
                    template: 'pages/library.html',
                    title: 'Library - Unknown Novel',
                    description: 'Koleksi dan history bacaan Anda',
                    init: 'initLibraryPage'
                },
                '/profile': {
                    template: 'pages/profile.html',
                    title: 'Profile - Unknown Novel',
                    description: 'Profile dan pengaturan akun Anda',
                    init: 'initProfilePage'
                },
                '/login': {
                    template: 'pages/login.html',
                    title: 'Masuk - Unknown Novel',
                    description: 'Masuk ke akun Unknown Novel',
                    init: 'initLoginPage'
                },
                '/register': {
                    template: 'pages/register.html',
                    title: 'Daftar - Unknown Novel',
                    description: 'Daftar akun baru di Unknown Novel',
                    init: 'initRegisterPage'
                }
            };

            // Handle initial page load
            this.handleRoute(window.location.pathname + window.location.search);

            // Listen for browser back/forward
            window.addEventListener('popstate', () => {
                this.handleRoute(window.location.pathname + window.location.search);
            });

            // Intercept all link clicks
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[data-link]');
                if (link) {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    this.navigate(href);
                }
            });

            // Listen for auth changes to update menu
            if (window.supabase) {
                window.supabase.auth.onAuthStateChange(() => {
                    this.updateAdminMenu();
                });
            }
            this.updateAdminMenu();
        },

        // Navigate to a new route
        navigate(path) {
            if (path !== window.location.pathname + window.location.search) {
                history.pushState(null, null, path);
            }
            this.handleRoute(path);
        },

        // Determine navigation direction
        getDirection(fromPath, toPath) {
            const fromIndex = this.pageOrder.indexOf(fromPath);
            const toIndex = this.pageOrder.indexOf(toPath);

            // If either page is not in the order (e.g., /login, /novel), default to right
            if (fromIndex === -1 || toIndex === -1) {
                return 'right';
            }

            // Going forward in the navigation order
            if (toIndex > fromIndex) {
                return 'right';
            }
            // Going backward in the navigation order
            else if (toIndex < fromIndex) {
                return 'left';
            }
            // Same page
            return 'right';
        },

        // Handle route change
        async handleRoute(path) {
            // Extract pathname without query string
            let pathname = path.split('?')[0];

            // Redirect /index.html to /
            if (pathname === '/index.html') {
                history.replaceState(null, null, '/');
                pathname = '/';
            }

            // Find matching route
            const route = this.routes[pathname];

            if (!route) {
                console.error(`Route not found: ${pathname}`);
                // Redirect to home for unknown routes
                if (pathname !== '/') {
                    history.replaceState(null, null, '/');
                    this.handleRoute('/');
                    return;
                }
                this.show404();
                return;
            }

            // Update page title and meta
            document.getElementById('page-title').textContent = route.title;
            document.getElementById('page-description').setAttribute('content', route.description);
            document.title = route.title;

            // Update active nav link
            this.updateActiveNav(pathname);

            // Toggle Bottom Nav Visibility (Hide on Read page)
            const bottomNav = document.getElementById('bottom-nav');
            if (bottomNav) {
                if (pathname === '/read') {
                    bottomNav.classList.add('hidden');
                } else {
                    bottomNav.classList.remove('hidden');
                }
            }

            // Determine navigation direction
            const direction = this.getDirection(this.currentPage, pathname);

            // Load and display content with direction
            await this.loadContent(route, path, direction);

            // Update current page
            this.currentPage = pathname;
        },

        // Load page content
        async loadContent(route, fullPath, direction) {
            const contentEl = document.getElementById('app-content');

            // Determine animation classes based on direction
            const outClass = direction === 'right' ? 'transitioning-right' : 'transitioning-left';
            const inClass = direction === 'right' ? 'slide-right' : 'slide-left';

            // Remove any existing animation classes
            contentEl.classList.remove('slide-right', 'slide-left', 'transitioning-right', 'transitioning-left', 'transitioning');

            // Add transitioning class for fade out
            contentEl.classList.add(outClass);

            // Wait for fade out animation
            await new Promise(resolve => setTimeout(resolve, 200));

            try {
                // Fetch page content
                const response = await fetch(route.template);
                if (!response.ok) throw new Error(`Failed to load ${route.template}`);

                const html = await response.text();

                // Update content
                contentEl.innerHTML = html;

                // Execute scripts found in the content
                const scripts = contentEl.querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });

                // Remove transitioning class and add slide-in class
                contentEl.classList.remove(outClass);
                contentEl.classList.add(inClass);

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'instant' });

                // Call page-specific initialization function if it exists
                // We wrap this in a slight timeout to ensure scripts have parsed/executed
                setTimeout(() => {
                    if (route.init && typeof window[route.init] === 'function') {
                        // Pass query parameters to init function
                        const params = new URLSearchParams(fullPath.split('?')[1] || '');
                        window[route.init](params);
                    }
                }, 0);

                // Re-attach event listeners for dynamic content
                this.attachDynamicListeners();

            } catch (error) {
                console.error('Error loading content:', error);
                contentEl.innerHTML = `
                    <div class="flex-1 flex items-center justify-center p-8">
                        <div class="text-center">
                            <i class="fas fa-exclamation-triangle text-5xl text-red-400 mb-4"></i>
                            <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">Gagal Memuat Halaman</h2>
                            <p class="text-slate-600 dark:text-slate-400 mb-4">Terjadi kesalahan saat memuat konten.</p>
                            <a href="/" data-link class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                Kembali ke Beranda
                            </a>
                        </div>
                    </div>
                `;
                contentEl.classList.remove(outClass);
            }
        },

        // Show 404 page
        show404() {
            const contentEl = document.getElementById('app-content');
            contentEl.innerHTML = `
                <div class="flex-1 flex items-center justify-center p-8">
                    <div class="text-center">
                        <i class="fas fa-question-circle text-6xl text-slate-300 dark:text-slate-600 mb-4"></i>
                        <h2 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">404 - Halaman Tidak Ditemukan</h2>
                        <p class="text-slate-600 dark:text-slate-400 mb-6">Halaman yang Anda cari tidak ada.</p>
                        <a href="/" data-link class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Kembali ke Beranda
                        </a>
                    </div>
                </div>
            `;
            document.title = '404 - Halaman Tidak Ditemukan';
        },

        // Update active nav link styling
        updateActiveNav(pathname) {
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active', 'font-semibold');
                link.style.color = '';
            });

            // Add active class to current page link
            const activeLink = document.querySelector(`.nav-link[href="${pathname}"]`);
            if (activeLink) {
                activeLink.classList.add('active', 'font-semibold');
                activeLink.style.color = '#007ACC';
            }
        },

        // Update menu based on role (Admin vs Reader)
        async updateAdminMenu() {
            try {
                const navItem = document.getElementById('nav-library');
                if (!navItem) return;

                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // Check if profile exists (Readers have profiles, Admins might not in this logic)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', session.user.id)
                        .single();

                    if (!profile) {
                        // Admin User
                        navItem.href = 'admin/dashboard.html';
                        navItem.removeAttribute('data-link');
                        navItem.innerHTML = `
                            <i class="fas fa-cogs text-xl"></i>
                            <span class="text-[10px] uppercase tracking-wider">Admin</span>
                        `;
                    } else {
                        // Reader User (Reset to Library)
                        navItem.href = '/library';
                        navItem.setAttribute('data-link', '');
                        navItem.innerHTML = `
                            <i class="fas fa-bookmark text-xl"></i>
                            <span class="text-[10px] uppercase tracking-wider">Library</span>
                         `;
                    }
                } else {
                    // Guest (Reset to Library)
                    navItem.href = '/library';
                    navItem.setAttribute('data-link', '');
                    navItem.innerHTML = `
                        <i class="fas fa-bookmark text-xl"></i>
                        <span class="text-[10px] uppercase tracking-wider">Library</span>
                     `;
                }
            } catch (e) {
                console.error("Error updating admin menu:", e);
            }
        },

        // Re-attach event listeners to dynamically loaded content
        attachDynamicListeners() {
            // Re-attach data-link listeners for dynamically loaded links
            document.querySelectorAll('#app-content a[data-link]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    this.navigate(href);
                });
            });
        }
    };

    // Initialize router when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => router.init());
    } else {
        router.init();
    }

    // Expose router globally for programmatic navigation
    window.spaRouter = router;

})();
