<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { firebaseConfig } from './utils/firebase'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { appIJK, authIJK, dbIJK } from './utils/injects'
import { provide, watch } from 'vue'
import router from './router'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)
const route = useRoute()

provide(appIJK, app)
provide(authIJK, auth)
provide(dbIJK, db)

function redirect() {
  if(['', 'home', 'auth'].includes(route.name as string) && auth.currentUser) router.push('/dashboard')
}

watch(() => route.name, redirect)
onAuthStateChanged(auth, redirect)
redirect()
</script>

<template>
  <RouterView />
</template>
