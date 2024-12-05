import type { DBUser } from "@/utils/types"
import { get, ref as dbref, type Database, type DatabaseReference, onValue } from 'firebase/database'
import { type Auth } from 'firebase/auth'
import { type Ref, ref } from "vue"

export async function useDBUser(auth: Auth, db: Database) {
    let dbuser: Ref<DBUser> = ref(await fetchUser(db, auth.currentUser?.uid || ''))
    let friends: Ref<DBUser[]> = ref([])
    onValue(
        dbref(db, `users/${auth.currentUser?.uid}/friends`),
        async (snap) => {
            friends.value = await Promise.all((snap.val() as string[]).map(async u => await fetchUser(db, u)) || [])
            console.log(friends.value)
            friends.value.forEach((friend) => {
                onValue(dbref(db, `users/${friend.id}`), snap2 => {
                    friends.value[friends.value.findIndex(f => f.id === friend.id)] = snap2.val()
                })
            })
        }
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

export async function fetchUser(db: Database, uid: string) {
	return (await get(dbref(db, `users/${uid}`))).val() as DBUser
}

export async function useReactiveDBRef(db: Database, path: DatabaseReference) {
    const r = ref(undefined) as Ref<any>

    onValue(path, (snap) => {
        r.value = snap.val()
    })

    return r
}