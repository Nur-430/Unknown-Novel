// Auth Helper for Unknown Novel
// Handles Username -> Email mapping for Supabase Auth
// Implements simple Captcha

const EMAIL_DOMAIN = "unknown-novel.local";

const Auth = {
    // Convert username to fake email
    toEmail: (username) => {
        return `${username.toLowerCase().trim()}@${EMAIL_DOMAIN}`;
    },

    // Validate username format
    isValidUsername: (username) => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    },

    // Register with Username
    signUp: async (username, password) => {
        if (!Auth.isValidUsername(username)) {
            throw new Error("Username hanya boleh huruf, angka, garis bawah (3-20 karakter).");
        }

        const email = Auth.toEmail(username);

        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username } // Save original username in metadata
            }
        });

        if (error) throw error;

        // 2. Create Profile entry (if not handled by Trigger)
        if (data.user) {
            await Auth.createProfile(data.user.id, username);
        }

        return data;
    },

    // Login with Username
    signIn: async (username, password) => {
        const email = Auth.toEmail(username);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return data;
    },

    // Create Profile in public table
    createProfile: async (userId, username) => {
        const { error } = await supabase
            .from('profiles')
            .insert({ id: userId, username: username, role: 'reader' });

        if (error) {
            // Ignore unique violation if already exists
            if (error.code !== '23505') console.error("Profile creation error:", error);
        }
    },

    // Get current user profile
    getProfile: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) return null;
        return data;
    },

    // Logout
    signOut: async () => {
        await supabase.auth.signOut();
        location.href = 'index.html'; // Redirect to home
    }
};


// Simple Math Captcha
const Captcha = {
    currentResult: 0,

    init: (canvasId) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Generate numbers
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        Captcha.currentResult = num1 + num2;

        // Draw background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw noise
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.strokeStyle = '#cbd5e1';
            ctx.stroke();
        }

        // Draw text
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${num1} + ${num2} = ?`, canvas.width / 2, canvas.height / 2);
    },

    validate: (input) => {
        return parseInt(input) === Captcha.currentResult;
    }
};
