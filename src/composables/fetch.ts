import type { DBUser } from "@/utils/types"
import { get, ref as dbref, type Database, onValue } from 'firebase/database'
import { type Auth } from 'firebase/auth'
import { type Ref, ref } from "vue"

export async function useDBUser(auth: Auth, db: Database) {
    let dbuser: Ref<DBUser> = ref(await fetchUser(db, auth.currentUser?.uid || ''))
    let friends: Ref<DBUser[]> = ref([])
    dbuser.value.friends?.forEach(async f =>
        friends.value.push(await fetchUser(db, f))
    )
    onValue(
        dbref(db, `users/${auth.currentUser?.uid}`),
        (snap) => {
            dbuser.value = snap.val()
            friends.value = []
            dbuser.value?.friends?.forEach(async f =>
                friends.value.push(await fetchUser(db, f))
            )
        }
    )

    return { dbuser, friends }
}

async function fetchUser(db: Database, uid: string) {
	return (await get(dbref(db, `users/${uid}`))).val() as DBUser
}