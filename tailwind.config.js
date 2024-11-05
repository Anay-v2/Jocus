/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
	content: ['./index.html', './src/**/*.{vue,ts}'],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: {
			primary: '#6A0DAD',
			secondary: '#FFCC00',
			accent: '#FF4081',
			neutral: '#2E2E3A',
		},
	},
	plugins: [daisyui],
}
