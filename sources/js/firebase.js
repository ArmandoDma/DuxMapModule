// Importa Firebase y los módulos necesarios
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configura la configuración de tu aplicación Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6Yoq0fhSJtSXXIFgdv6WzfecGon4lM1Y",
  authDomain: "duxmapmodule.firebaseapp.com",
  databaseURL: "https://duxmapmodule-default-rtdb.firebaseio.com",
  projectId: "duxmapmodule",
  storageBucket: "duxmapmodule.appspot.com",
  messagingSenderId: "982258929337",
  appId: "1:982258929337:web:0829b8d8c84966793ad568"
};

// Inicializa Firebase antes de usar cualquier otro servicio
const app = initializeApp(firebaseConfig);
const dbRef = ref(getDatabase());

export {dbRef}
