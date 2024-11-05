<script setup lang="ts">
import { RouterView } from 'vue-router'
import { firebaseConfig } from './utils/firebase'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { appIJK, authIJK, dbIJK } from './utils/injects'
import { provide } from 'vue'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase(app)

provide(appIJK, app)
provide(authIJK, auth)
provide(dbIJK, db)
</script>

<template>
  <RouterView />
</template>
