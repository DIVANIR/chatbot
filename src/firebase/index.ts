import { initializeApp, applicationDefault, cert } from 'firebase-admin/app'
import { getFirestore} from 'firebase-admin/firestore'

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://assiatnt-19884-default-rtdb.firebaseio.com"
});
export const db = getFirestore()