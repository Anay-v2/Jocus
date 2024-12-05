<script setup lang="ts">
import SNavbar from '@/components/SNavbar.vue';
import { fetchUser, useDBUser, useReactiveDBRef } from '@/composables/fetch';
import router from '@/router';
import { games } from '@/utils/games';
import { authIJK, dbIJK } from '@/utils/injects';
import type { DBGame, DBUser } from '@/utils/types';
import { type Auth } from 'firebase/auth';
import { type Database, ref as dbref, set } from 'firebase/database';
import { computed, inject, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { Play } from 'lucide-vue-next';
import GameJoinIndicator from '@/components/GameJoinIndicator.vue';
import UnoGame from '@/components/games/UnoGame.vue';

    const route = useRoute()
    const auth = inject(authIJK) as Auth
    const db = inject(dbIJK) as Database
    const sgame = computed(() => games.find(g => g.id === game.value?.game))
    const game = await useReactiveDBRef(db, dbref(db, `games/${route.params.id}`)) as Ref<DBGame>
    const loading = ref([false])
    if (!route.params.id) router.push('/')
    const { dbuser, friends } = await useDBUser(auth, db)
    if(!game.value || !game.value.players.includes(auth.currentUser?.uid || '')) router.push('/')
    await set(dbref(db, `games/${game.value.id}/joined`), Array.from(new Set([
        ...(game.value.joined || []),
        auth.currentUser?.uid
    ])))
    const gamePlayers: Ref<DBUser[]> = ref([])
    async function startGame() {
        loading.value[0] = true
        await set(dbref(db, `games/${game.value.id}/status`), 's')
        loading.value[0] = false
    }

    watch(() => game.value.players, async () => {
        gamePlayers.value = await Promise.all(game.value.players.map(async p => await fetchUser(db, p) as DBUser))
    }, { immediate: true })
</script>
<template>
    <header>
        <SNavbar :user="dbuser" />
    </header>
    <main>
		<div class="grid place-items-center w-screen h-[90vh]" v-if="game.status === 'n'">
			<div
				class="grid place-items-center bg-slate-100 dark:bg-slate-900 rounded-lg py-8 min-w-[50vw] min-h-[80vh] max-w-[80vw] max-h-screen">
				<h1 class="mb-auto text-4xl font-bold font-alt">Game Lobby</h1>
                <GameJoinIndicator :game :user="dbuser" :gamePlayers />
						<Spinner class="fill-white" v-if="loading[0]" />
				<button class="btn btn-primary" :disabled="!(((game.joined?.length || 0) >= (sgame?.players[0] || 1)) && ((game.joined?.length || 0) <= (sgame?.players[1] || Infinity))) || loading[0]" v-if="auth.currentUser?.uid === game.creator" @click="startGame()">
						<Spinner class="fill-white" v-if="loading[0]" />
                        <Play v-if="!loading[0]" /> Start Game
                </button>
			</div>
		</div>
        <template v-else>
            <UnoGame v-if="sgame?.id === 'uno'" :game :user="dbuser" :gamePlayers />
        </template>
    </main>
</template>