<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next';
</script>

<template>
    <div class="navbar h-[10vh]">
        <button class="text-xl font-extrabold btn btn-primary font-alt">Jocus</button>
        <div class="w-[85%] navbar-center">
            <ul class="px-1 navbar-menu">
                <li class="btn btn-primary" @click="$router.push('/')"><RouterLink to="/">Home</RouterLink></li>
                <li class="btn btn-primary" @click="$router.push('/games')"><RouterLink to="/games">Games</RouterLink></li>
            </ul>
        </div>
        <RouterLink to="/auth"><button class="flex items-center gap-2 bg-green-300 btn btn-primary dark:bg-green-700 hover:bg-green-400 dark:hover:bg-green-800">Get started <ArrowRight /></button></RouterLink>
    </div>
</template>