/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./web/**/*.{html,js}"],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                // We can add custom JokoUI colors here later
            }
        },
    },
    plugins: [],
}
