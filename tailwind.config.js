/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,ts}'],
	darkMode: 'selector',
	theme: {
		extend: {
			colors: {
				primary: '#4CAF50',
			}
		},
	},
}
