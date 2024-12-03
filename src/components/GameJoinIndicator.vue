<script setup lang="ts">
    import { authIJK, dbIJK } from '@/utils/injects';
import type { DBGame, DBUser } from '@/utils/types';
import type { Auth } from 'firebase/auth';
import type { Database } from 'firebase/database';
import { inject, ref, watch, type Ref } from 'vue';

    const auth = inject(authIJK) as Auth
    const db = inject(dbIJK) as Database

    const { game, user, gamePlayers } = defineProps<{
        game: DBGame
        user: DBUser
        gamePlayers: DBUser[]
    }>()
</script>
<template>
    <ul
					class="w-[80%] p-4 rounded-lg bg-slate-200 dark:bg-slate-800 grid place-items-center">
					<h1 class="w-full text-2xl font-bold text-center font-alt">Players</h1>
					<li
						v-for="player in gamePlayers"
						:key="player.id"
						class="flex items-center w-full text-lg">
						<div class="rounded-full btn btn-neutral">
							<img
								:src="player.pic"
								class="w-10 h-10 rounded-full" />
						</div>
						{{ player.username }}
						<span
							class="ml-auto"
                            :class="{ 'text-red-600': game.declined?.includes(player.id), 'dark:text-red-400': game.declined?.includes(player.id), 'text-green-600': game.joined?.includes(player.id), 'dark:text-green-400': game.joined?.includes(player.id)}">
							{{ 
                                game.declined?.includes(player.id)
                                ? 'Declined'
                                : game.joined?.includes(player.id)
                                ? 'Accepted'
                                : 'Pending'
                            }}
						</span>
					</li>
				</ul>
</template>