export function updateTheme(document: Document, window: Window) {
	const theme = localStorage.getItem('theme')
	document.documentElement.classList.toggle(
		'dark',
		theme === 'd' ||
			(!theme &&
				window.matchMedia('(prefers-color-scheme: dark)').matches)
	)
}
