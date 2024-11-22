<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { KeyRound, Mail, Eye, EyeOff, User } from 'lucide-vue-next'
import Spinner from '@/components/Spinner.vue'
import {
	createUserWithEmailAndPassword,
	sendEmailVerification,
	signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    type Auth
} from 'firebase/auth'
import { authIJK, dbIJK } from '@/utils/injects'
import router from '@/router'
import { set, ref as dbref, get } from 'firebase/database'
import google from '@/assets/google.png'

const auth = inject(authIJK)
const db = inject(dbIJK)
const stage = ref(0)
const loading = ref([false, false, false, false])
const googleProvider = new GoogleAuthProvider()

const email = ref('')
const emailInputted = ref(false)
const emailValid = computed(
	() => email.value.match(/^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/) !== null
)
const password = ref('')
const passwordInputted = ref(false)
const passwordValid = computed(() => {
	const l = [
		password.value.length >= 8, // at least 8 characters
		password.value.match(/[a-z]/) !== null, // at least one lowercase
		password.value.match(/[A-Z]/) !== null, // at least one uppercase
		password.value.match(/[0-9]/) !== null, // at least one digit
		password.value.match(/[^\w\d\s]/) !== null, // at least one special character
	]
	return [l.every(m => m), ...l]
})
const show = ref(false)

const username = ref('')
const usernameInputted = ref(false)
const usernameValid = computed(
	() => username.value.length >= 3 && username.value.length <= 15
)
const cpassword = ref('')
const cpasswordInputted = ref(false)
const cshow = ref(false)

async function login() {
	if (!emailValid.value || !passwordValid.value[0] || !auth) return
	loading.value[0] = true
	await signInWithEmailAndPassword(auth, email.value, password.value)
	loading.value[0] = false
	router.push('/dashboard')
}

async function signup() {
	if (
		!usernameValid.value ||
		!emailValid.value ||
		!passwordValid.value[0] ||
		cpassword.value !== password.value ||
		!auth ||
		!db
	)
		return
	loading.value[1] = true
	await createUserWithEmailAndPassword(auth, email.value, password.value)
	await setDbInfo()
	if (auth.currentUser) await sendEmailVerification(auth.currentUser)
	loading.value[1] = false
	stage.value = 2
}

async function googlesignup() {
    if(!auth || !db) return
    loading.value[2] = true
    await signInWithPopup(auth, googleProvider)
    if(!(await hasDbInfo())) await setDbInfo(true)
    loading.value[2] = false
    router.push('/dashboard')
}

async function hasDbInfo() {
    if (!auth || !db || !auth.currentUser) return false
    const snap = await get(dbref(db, `users/${auth.currentUser?.uid}`))
    return snap.exists()
}

async function setDbInfo(google: boolean = false) {
	if (!auth || !db || !auth.currentUser) return
	await set(dbref(db, `users/${auth.currentUser?.uid}`), {
		id: auth.currentUser?.uid,
		username: google ? auth.currentUser.displayName : username.value,
		pic: google
			? auth.currentUser?.photoURL
			: `https://ui-avatars.com/api/?name=${encodeURIComponent(
					username.value
			  )}&size=12`,
	})
}

async function passwordreset() {
    if (!emailValid.value || !auth) return
    loading.value[3] = true
    await sendPasswordResetEmail(auth, email.value)
    loading.value[3] = false
    stage.value = 4
}
</script>
<template>
	<main class="grid w-screen h-screen place-items-center">
		<div
			class="grid place-items-center bg-slate-100 dark:bg-slate-900 rounded-lg py-8 min-w-[50vw] min-h-[80vh] max-w-[80vw] max-h-screen">
				<div class="mb-4 text-4xl font-bold font-alt">
					{{
						[
							'Log in',
							'Sign up',
							'Verify email',
							'Forgot password',
                            'Forgot password',
						][stage]
					}}
				</div>
				<div
					v-if="stage === 0 || stage === 1 || stage === 3"
					class="grid w-full place-items-center">
					<label
						class="flex items-center w-[50%] gap-2 mb-8 input"
						:class="{ 'input-error': !usernameValid }"
						v-if="stage === 1">
						<User />
						<input
							type="text"
							class="grow"
							placeholder="Username (3-15 characters)"
							@input="usernameInputted = true"
							v-model="username" />
					</label>
					<label
						class="flex items-center w-[50%] gap-2 mb-8 input"
						:class="{ 'input-error': !emailValid }">
						<Mail />
						<input
							type="email"
							class="grow"
							placeholder="Email"
							@input="emailInputted = true"
							v-model="email" />
					</label>
					<label
						class="flex items-center w-[50%] gap-2 input"
                        v-if="stage !== 3"
						:class="{
							'input-error': !passwordValid[0],
							'mb-8': stage === 1,
						}">
						<KeyRound />
						<input
							:type="show ? 'text' : 'password'"
							class="grow"
							placeholder="Password"
							@input="passwordInputted = true"
							v-model="password" />
						<button
							class="btn btn-sm btn-circle btn-ghost"
							@click="show = !show">
							<component :is="show ? EyeOff : Eye" />
						</button>
					</label>
					<div
						class="w-[50%] text-right"
						v-if="stage === 0">
						<span class="cursor-pointer text-primary" @click="stage = 3"
							>Forgot password?</span
						>
					</div>
					<label
						class="flex items-center w-[50%] gap-2 input"
						:class="{ 'input-error': cpassword !== password }"
						v-if="stage === 1">
						<KeyRound />
						<input
							:type="cshow ? 'text' : 'password'"
							class="grow"
							placeholder="Confirm password"
							@input="cpasswordInputted = true"
							v-model="cpassword" />
						<button
							class="btn btn-sm btn-circle btn-ghost"
							@click="cshow = !cshow">
							<component :is="cshow ? EyeOff : Eye" />
						</button>
					</label>
					<ul class="mt-2 text-center" v-if="stage === 0 || stage === 1">
						<li
							v-if="!passwordValid[1] && passwordInputted"
							class="text-red-500">
							&times; Is 8 characters long
						</li>
						<li
							v-if="
								(!passwordValid[2] || !passwordValid[3]) &&
								passwordInputted
							"
							class="text-red-500">
							&times; Contains both uppercase and lowercase
							characters
						</li>
						<li
							v-if="!passwordValid[4] && passwordInputted"
							class="text-red-500">
							&times; Contains digits
						</li>
						<li
							v-if="!passwordValid[5] && passwordInputted"
							class="text-red-500">
							&times; Contains special characters
						</li>
					</ul>
				</div>
				<div v-if="stage === 2 || stage === 4">
					<p>
						We've sent you a link to {{ stage === 2 ? 'verify your email' : 'reset your password' }}. Please check
						your
						<a
							target="_blank"
							href="https://mail.google.com"
							class="no-underline text-primary"
							>inbox</a
						> for further instructions.
					</p>
				</div>
				<div
					class="w-[50%] card-actions"
					v-if="stage === 0">
					<button
						class="w-full mt-4 btn btn-primary"
						:disabled="
							!emailValid || !passwordValid[0] || loading[0]
						"
						@click="login()">
						<Spinner class="fill-white" v-if="loading[0]" />
						Log in
					</button>
                    <button
						class="flex items-center justify-center w-full p-2 text-gray-800 bg-white rounded-lg hover:bg-white btn-icon"
						@click="googlesignup()"
						:disabled="loading[2]">
						<img
							:src="google"
							class="w-8 h-8"
							v-if="!loading[2]" />
						<Spinner class="fill-black" v-if="loading[2]" />
						<span class="ml-2">Sign in with Google</span>
					</button>
					<div class="flex">
					Don't have an account yet?
					<span
						class="cursor-pointer text-primary ml-[1ch]"
						@click="stage = 1"
						>Sign up</span
					>.</div>
				</div>
				<div
					class="w-[50%] card-actions"
					v-if="stage === 1">
					<button
						class="w-full mt-4 btn btn-primary"
						:disabled="
							!usernameValid ||
							!emailValid ||
							!passwordValid[0] ||
							cpassword !== password ||
							loading[1]
						"
						@click="signup()">
						<Spinner class="fill-white" v-if="loading[1]" />
						Sign up
					</button>
					<button
						class="flex items-center justify-center w-full p-2 text-gray-800 bg-white rounded-lg hover:bg-white btn-icon"
						@click="googlesignup()"
						:disabled="loading[2]">
						<img
							:src="google"
							class="w-8 h-8"
							v-if="!loading[2]" />
						<Spinner class="fill-black" v-if="loading[2]" />
						<span class="ml-2">Sign in with Google</span>
					</button>
					<div class="flex">
					Already have an account?
					<span
						class="cursor-pointer text-primary ml-[1ch]"
						@click="stage = 0"
						>Log in</span
					>.</div>
				</div>
				<div
					class="w-[50%] card-actions"
					v-if="stage === 2 || stage === 4">
					<button
						class="w-full btn btn-primary"
						@click="router.push('/dashboard')">
						Continue
					</button>
				</div>
                <div class="w-[50%] card-actions" v-if="stage === 3">
                    <button
                        class="w-full btn btn-primary"
                        @click="passwordreset()" :disabled="loading[3]">
						<Spinner class="fill-white" v-if="loading[3]" />
                        Send reset link
                    </button>
                </div>
		</div>
	</main>
</template>

<style>
.card-actions {
	@apply h-full flex flex-col justify-end gap-4
}
</style>