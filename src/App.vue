<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { firebaseConfig } from './utils/firebase'
import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref as dbref, set, onDisconnect } from 'firebase/database'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { appIJK, authIJK, dbIJK } from './utils/injects'
import { provide, watch } from 'vue'
import router from './router'
import { updateTheme } from './utils/theme'
import FullScreenLoading from './components/FullScreenLoading.vue'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)
const route = useRoute()

provide(appIJK, app)
provide(authIJK, auth)
provide(dbIJK, db)

function redirect() {
  console.log(auth.currentUser, route.name)
  if(['', 'home', 'auth'].includes(route.name as string) && auth.currentUser) router.push('/dashboard')
  if(['dashboard'].includes(route.name as string) && !auth.currentUser) router.push('/')
  if(auth.currentUser) {
    const userStatusRef = dbref(db, `users/${auth.currentUser.uid}/status`)
    const connectedRef = dbref(db, `.info/connected`)
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(userStatusRef, { state: `online`, lastChanged: Date.now() })
        onDisconnect(userStatusRef).set({ state: `offline`, lastChanged: Date.now() })
      }
    })
  }
}

watch(() => route.name, redirect)
onAuthStateChanged(auth, redirect)

updateTheme(document, window)
</script>

<template>
  <Suspense timeout="0">
    <RouterView />
    <template #fallback><FullScreenLoading /></template>
  </Suspense>
</template>
