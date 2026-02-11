// Reader Authentication System
// Uses Supabase Auth with username-based authentication

/**
 * Register a new user
 * @param {string} username - Username (3-20 characters)
 * @param {string} password - Password (min 6 characters)
 * @returns {Object} - { success: boolean, error?: string, user?: Object }
 */
async function registerUser(username, password) {
    try {
        // Validate username format
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            return {
                success: false,
                error: 'Username harus 3-20 karakter dan hanya boleh huruf, angka, dan underscore'
            };
        }

        // Create a dummy email from username for Supabase Auth
        const email = `${username}@reader.unknownnovel.local`;

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    username: username,
                    role: 'reader'
                }
            }
        });

        if (authError) {
            console.error('Auth error:', authError);

            // Handle specific errors
            if (authError.message.includes('rate limit')) {
                return {
                    success: false,
                    error: 'Terlalu banyak percobaan. Harap tunggu beberapa menit dan coba lagi.'
                };
            }

            if (authError.message.includes('already registered')) {
                return {
                    success: false,
                    error: 'Username sudah digunakan'
                };
            }

            return {
                success: false,
                error: 'Gagal membuat akun: ' + authError.message
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'Gagal membuat akun'
            };
        }

        // Small delay to ensure auth user is fully created
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create profile entry
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: authData.user.id,
                username: username
            }]);

        if (profileError) {
            console.error('Profile error:', profileError);

            // Check for unique constraint violation
            if (profileError.code === '23505') {
                return {
                    success: false,
                    error: 'Username sudah digunakan'
                };
            }

            // Check for table not found
            if (profileError.code === '42P01') {
                return {
                    success: false,
                    error: 'Tabel profiles belum dibuat. Silakan hubungi administrator.'
                };
            }

            // Don't clean up auth user - let them try to complete profile later
            return {
                success: false,
                error: 'Gagal membuat profil. Error: ' + profileError.message
            };
        }

        // Store session info
        localStorage.setItem('reader_user', JSON.stringify({
            id: authData.user.id,
            username: username,
            created_at: authData.user.created_at
        }));

        return {
            success: true,
            user: {
                id: authData.user.id,
                username: username,
                created_at: authData.user.created_at
            }
        };

    } catch (err) {
        console.error('Registration error:', err);
        return {
            success: false,
            error: 'Terjadi kesalahan saat registrasi'
        };
    }
}

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Object} - { success: boolean, error?: string, user?: Object }
 */
async function loginUser(username, password) {
    try {
        // Get profile to find the user ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();

        if (profileError || !profile) {
            return {
                success: false,
                error: 'Username atau password salah'
            };
        }

        // Construct email from username
        const email = `${username}@reader.unknownnovel.local`;

        // Sign in with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) {
            return {
                success: false,
                error: 'Username atau password salah'
            };
        }

        // Store session info
        localStorage.setItem('reader_user', JSON.stringify({
            id: authData.user.id,
            username: profile.username,
            created_at: profile.created_at
        }));

        return {
            success: true,
            user: {
                id: authData.user.id,
                username: profile.username,
                created_at: profile.created_at
            }
        };

    } catch (err) {
        console.error('Login error:', err);
        return {
            success: false,
            error: 'Terjadi kesalahan saat login'
        };
    }
}

/**
 * Get current logged in user
 * @returns {Object|null} - User object or null if not logged in
 */
async function getCurrentUser() {
    try {
        // Check localStorage first
        const storedUser = localStorage.getItem('reader_user');
        if (!storedUser) {
            return null;
        }

        // Verify session with Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            localStorage.removeItem('reader_user');
            return null;
        }

        // Get latest profile data
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (!profile) {
            localStorage.removeItem('reader_user');
            return null;
        }

        return {
            id: profile.id,
            username: profile.username,
            created_at: profile.created_at
        };

    } catch (err) {
        console.error('Get current user error:', err);
        return null;
    }
}

/**
 * Logout user
 */
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('reader_user');
        return { success: true };
    } catch (err) {
        console.error('Logout error:', err);
        return { success: false, error: 'Gagal logout' };
    }
}

/**
 * Change password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} - { success: boolean, error?: string }
 */
async function changePassword(currentPassword, newPassword) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Anda belum login' };
        }

        // Verify current password by attempting to re-login
        const email = `${user.username}@reader.unknownnovel.local`;
        const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: email,
            password: currentPassword
        });

        if (verifyError) {
            return { success: false, error: 'Password lama salah' };
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            return { success: false, error: 'Gagal mengubah password' };
        }

        return { success: true };

    } catch (err) {
        console.error('Change password error:', err);
        return { success: false, error: 'Terjadi kesalahan' };
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Check authentication state and update UI accordingly
 * @param {Object} options - Configuration options
 * @param {boolean} options.redirectIfNotAuth - Redirect to login if not authenticated
 * @param {string} options.redirectUrl - URL to redirect to if not authenticated
 * @param {Function} options.onAuthSuccess - Callback when user is authenticated
 * @param {Function} options.onAuthFail - Callback when user is not authenticated
 */
async function checkAuthState(options = {}) {
    const {
        redirectIfNotAuth = false,
        redirectUrl = 'login.html',
        onAuthSuccess = null,
        onAuthFail = null
    } = options;

    const user = await getCurrentUser();

    if (user && onAuthSuccess) {
        onAuthSuccess(user);
    } else if (!user && redirectIfNotAuth) {
        window.location.href = redirectUrl;
    } else if (!user && onAuthFail) {
        onAuthFail();
    }

    return user;
}

/**
 * Update navigation to show user is logged in
 * @param {Object} user - User object
 */
function updateNavForLoggedInUser(user) {
    // Update Akun link to point to profile instead of login
    const akunLinks = document.querySelectorAll('a[href="login-selection.html"], a[href="admin/login.html"]');
    akunLinks.forEach(link => {
        // Only update if it's in bottom nav (has specific class structure)
        if (link.querySelector('.fa-user-circle') || link.textContent.includes('Akun')) {
            link.href = 'profile.html';
        }
    });
}

