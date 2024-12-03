<script setup lang="ts">
import router from '@/router'
import { ArrowLeft } from 'lucide-vue-next'
</script>
<template>
	<main>
		<div class="grid place-items-center w-screen h-[90vh]">
			<div
				class="flex flex-col items-center bg-slate-100 dark:bg-slate-900 rounded-lg py-8 min-w-[50vw] max-w-[80vw] h-fit">
				<h1 class="mb-8 text-4xl font-bold font-alt">404</h1>
				<p>The requested resource was not found.</p>
				<button
					class="mt-8 btn btn-primary"
					@click="router.push('/')">
					<ArrowLeft />Back to Home
				</button>
			</div>
		</div>
	</main>
</template>
