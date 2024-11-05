<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="navbar bg-base-200">
        <div class="flex-1">
            <a class="text-xl btn btn-ghost">Jocus</a>
        </div>
        <div class="flex-none navbar-center">
            <ul class="px-1 menu menu-horizontal">
                <li><RouterLink to="/">Home</RouterLink></li>
                <li><RouterLink to="/games">Games</RouterLink></li>
            </ul>
        </div>
        <div class="navbar-end">
            <RouterLink to="/auth"><button class="btn btn-primary">Get started</button></RouterLink>
        </div>
    </div>
</template>