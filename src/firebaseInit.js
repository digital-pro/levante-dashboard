import firebaseConfig from "./config/firebase";
import { RoarFirekit } from "@bdelab/roar-firekit";
import { markRaw } from "vue";

export async function initNewFirekit() {
  const firekit = markRaw(new RoarFirekit({ 
    roarConfig: firebaseConfig, 
    authPersistence: 'session', 
    markRawConfig: { 
      auth: false, 
      db: true, 
      functions: false
    }
  }));
  return await firekit.init();
}