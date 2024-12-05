<script setup lang="ts">
import type { PCard, UNOCard } from '@/utils/types';
import { ref } from 'vue';

    const { w = -1, h = -1, c = {
        type: 'p',
        card: 's1'
    } } = defineProps<{
        w?: number
        h?: number
        c?: UNOCard | PCard
    }>()

    //? https://www.lichter.io/articles/nuxt3-vue3-dynamic-images/
    const filename = (a: string) => a.replace(/\/src\/assets\/(playing|uno)-cards\//g, '').replace(/\.png$/g, '')
    const uno = import.meta.glob('@/assets/uno-cards/*.png', { eager: true })
    const playing = import.meta.glob('@/assets/playing-cards/*.png', { eager: true })
    const unocards = Object.fromEntries(
        //@ts-ignore
        Object.entries(uno).map(([key, value]) => [filename(key), value.default])
    )
    const playingcards = Object.fromEntries(
        //@ts-ignore
        Object.entries(playing).map(([key, value]) => [filename(key), value.default])
    )

    const card = c.type === 'u' ? unocards[c.card] : playingcards[c.card]
    const width = w === -1 ? 150 : w
    const height = h === -1 ? 245 : h
    setInterval(() => {
        console.log(card, unocards, playingcards)
    }, 1000)
</script>

<template>
    <img :src="card" :width :height />
</template>