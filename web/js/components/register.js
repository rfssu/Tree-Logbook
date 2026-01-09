// Register Component
function renderRegister() {
    const html = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4 py-12">
      <div class="max-w-md w-full">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Account</h1>
          <p class="text-gray-600 mt-2">Join Tree-ID Management System</p>
        </div>

        <!-- Register Card -->
        <div class="card p-8">
          <form id="register-form" class="space-y-4">
            <div>
              <label for="reg-username" class="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                id="reg-username"
                name="username"
                class="input"
                placeholder="Choose a username"
                required
                minlength="3"
              />
              <p class="text-xs text-gray-500 mt-1">At least 3 characters</p>
            </div>

            <div>
              <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="reg-email"
                name="email"
                class="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label for="reg-full-name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="reg-full-name"
                name="full_name"
                class="input"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                id="reg-password"
                name="password"
                class="input"
                placeholder="Create a password"
                required
                minlength="6"
              />
              <p class="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label for="reg-confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                id="reg-confirm-password"
                name="confirm_password"
                class="input"
                placeholder="Confirm your password"
                required
                minlength="6"
              />
            </div>

            <button type="submit" class="btn btn-primary w-full">
              Create Account
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Already have an account?
              <a href="#/login" class="text-green-600 hover:text-green-700 font-medium">
                Login here
              </a>
            </p>
          </div>

          <!-- Info Note -->
          <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-800">
              <strong>Note:</strong> New accounts will have "viewer" role by default. 
              Contact admin to upgrade permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

    render(html);

    // Attach form handler
    document.getElementById('register-form').addEventListener('submit', handleRegisterSubmit);
}

async function handleRegisterSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const fullName = document.getElementById('reg-full-name').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    // Validation
    if (!username || !email || !fullName || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    await Auth.register({
        username,
        email,
        password,
        full_name: fullName
    });
}
