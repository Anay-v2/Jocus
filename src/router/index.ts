import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ProfileSettingsView from '@/views/ProfileSettingsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import NewGameView from '@/views/NewGameView.vue'
import GameView from '@/views/GameView.vue'
import The404View from '@/views/The404View.vue'

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/auth',
			name: 'auth',
			component: AuthView,
		},
		{
			path: '/dashboard',
			name: 'dashboard',
			component: DashboardView,
		},
		{
			path: '/profile/settings',
			name: 'profile-settings',
			component: ProfileSettingsView,
		},
		{
			path: '/profile/:id',
			name: 'profile',
			component: ProfileView,
		},
		{
			path: '/new',
			name: 'new game',
			component: NewGameView,
		},
		{
			path: '/new/:id',
			name: 'new game id',
			component: NewGameView,
		},
		{
			path: '/game/:id',
			name: 'game',
			component: GameView,
		},
		{ path: '/:pathMatch(.*)', name: '404', component: The404View },
	],
})

export default router
