/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
	content: ['./index.html', './src/**/*.{vue,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#4CAF50',
			}
		},
	},
}
