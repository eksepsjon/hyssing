module.exports = {
    mode: 'jit',
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        fontFamily: {
            'sans': ['ui-sans-serif', 'KoHo'],
            'mono': ['ui-monospace', 'Fira Mono'],
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [],
}