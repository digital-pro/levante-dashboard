import firebaseConfig from "./config/firebase";
import { RoarFirekit } from "@bdelab/roar-firekit";

export async function initNewFirekit() {
  const firekit = new RoarFirekit({ 
    roarConfig: firebaseConfig, 
    authPersistence: 'session', 
    markRawConfig: { 
      auth: false, 
      db: false, 
      functions: false
    }
  });
  return await firekit.init();
}
