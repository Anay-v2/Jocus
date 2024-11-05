import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Database } from "firebase/database";
import type { InjectionKey } from "vue";

const appIJK = Symbol() as InjectionKey<FirebaseApp>
const authIJK = Symbol() as InjectionKey<Auth>
const dbIJK = Symbol() as InjectionKey<Database>

export { appIJK, authIJK, dbIJK }