import * as assessmentFirebaseConfig from '../../firebase/assessment/firebase.json';
import * as adminFirebaseConfig from '../../firebase/admin/firebase.json';

let appConfig;
let adminConfig;

const isEmulated = import.meta.env.VITE_FIREBASE_EMULATOR === 'true';
const useSandbox = import.meta.env.VITE_FIREBASE_DATA_SOURCE === 'sandbox';
const isStaging = import.meta.env.VITE_STAGING_BUILD === 'true';

function setDebugToken(config) {
  // If the NODE_ENV = test, use the debug token from the Cypress config (NODE_ENV is set to test in the Cypress test GitHub action)
  // Otherwise, use the VITE_APPCHECK_DEBUG_TOKEN environment variable (set as a local environment variable in the .env file and in the GitHub action for preview builds)
  // If neither are set, create a new debug token which will be inactive until it is set in the Firebase App Check console
  const debugToken =
    import.meta.env.NODE_ENV === 'test'
      ? Cypress.env('appCheckDebugToken')
      : import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || (self.FIREBASE_APPCHECK_DEBUG_TOKEN = true);

  if (debugToken) {
    config.debugToken = debugToken;
  }
}

if (isEmulated) {
  appConfig = {
    projectId: 'demo-gse-roar-assessment',
    apiKey: 'any-string-value',
    emulatorPorts: {
      db: assessmentFirebaseConfig.emulators.firestore.port,
      auth: assessmentFirebaseConfig.emulators.auth.port,
      functions: assessmentFirebaseConfig.emulators.functions.port,
    },
  };
  adminConfig = {
    projectId: 'demo-gse-roar-admin',
    apiKey: 'any-string-value',
    emulatorPorts: {
      db: adminFirebaseConfig.emulators.firestore.port,
      auth: adminFirebaseConfig.emulators.auth.port,
      functions: adminFirebaseConfig.emulators.functions.port,
    },
  };
} else if (useSandbox) {
  appConfig = {
    apiKey: 'AIzaSyCEUxEgYMp4fg2zORT0lsgn4Q6CCoMVzjU',
    authDomain: 'gse-roar-assessment-dev.firebaseapp.com',
    projectId: 'gse-roar-assessment-dev',
    storageBucket: 'gse-roar-assessment-dev.appspot.com',
    messagingSenderId: '26086061121',
    appId: '1:26086061121:web:262163d6c145b7a80bc2c0',
    siteKey: '6Ldq2SEqAAAAAKXTxXs9GnykkEZLYeVijzAKzqfQ',
  };
  adminConfig = {
    apiKey: 'AIzaSyCl-JsYraUfofQZXpzshQ6s-E0nYzlCvvg',
    authDomain: 'gse-roar-admin-dev.firebaseapp.com',
    projectId: 'gse-roar-admin-dev',
    storageBucket: 'gse-roar-admin-dev.appspot.com',
    messagingSenderId: '401455396681',
    appId: '1:401455396681:web:859ea073a116d0aececc98',
    siteKey: '6LeTgCEqAAAAAPVXEVtWoinVf_CLYF30PaETyyiT',
  };
} else {
  appConfig = {
    apiKey: 'AIzaSyDw0TnTXbvRyoVo5_oa_muhXk9q7783k_g',
    authDomain: isStaging ? 'roar-staging.web.app' : 'roar.education',
    projectId: 'gse-roar-assessment',
    storageBucket: 'gse-roar-assessment.appspot.com',
    messagingSenderId: '757277423033',
    appId: '1:757277423033:web:d6e204ee2dd1047cb77268',
    siteKey: '6Lc54SEqAAAAAKJF8QNpEzU6wHtXGAteVvrdB8XK',
  };

  adminConfig = {
    apiKey: 'AIzaSyBz0CTdyfgNXr7VJqcYOPlG609XDs97Tn8',
    authDomain: isStaging ? 'roar-staging.web.app' : 'roar.education',
    projectId: 'gse-roar-admin',
    storageBucket: 'gse-roar-admin.appspot.com',
    messagingSenderId: '1062489366521',
    appId: '1:1062489366521:web:d0b8b5371a67332d1d2728',
    measurementId: 'G-YYE3YN0S99',
    siteKey: '6Ler4SEqAAAAAJSAaJAwEAegdQAzioF3xVtm68v0',
  };
}

setDebugToken(appConfig);
setDebugToken(adminConfig);

export default {
  app: appConfig,
  admin: adminConfig,
};
