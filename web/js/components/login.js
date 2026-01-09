// Login Component
function renderLogin() {
    const html = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div class="max-w-md w-full">
        <!-- Logo/Header -->
        <div class="text-center mb-8">
          <div class="inline-block p-4 bg-green-500 rounded-full mb-4">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Tree-ID</h1>
          <p class="text-gray-600 mt-2">Tree Management System</p>
        </div>

        <!-- Login Card -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Login</h2>
          
          <form id="login-form" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                class="input"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                class="input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" class="btn btn-primary w-full">
              Login
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <a href="#/register" class="text-green-600 hover:text-green-700 font-medium">
                Register here
              </a>
            </p>
          </div>

          <!-- Demo Credentials -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</p>
            <div class="text-xs text-blue-700 space-y-1">
              <div><strong>Admin:</strong> johndoe / password123</div>
              <div><strong>Note:</strong> johndoe has been upgraded to admin role</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    render(html);

    // Attach form handler
    document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);
}

async function handleLoginSubmit(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    await Auth.login(username, password);
}
