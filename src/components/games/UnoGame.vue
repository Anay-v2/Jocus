<script setup lang="ts">
    import type { DBGame, DBUser } from '@/utils/types';

    const { game, user, gamePlayers } = defineProps<{
        game: DBGame,
        user: DBUser,
        gamePlayers: DBUser[]
    }>()
</script>
<template>
    
</template>