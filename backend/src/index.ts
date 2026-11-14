import { config } from "./config.js";
import { createApp } from "./app.js";
import { firebaseConfigured } from "./firebase.js";
import { selectRepo } from "./repositories/index.js";

if (!config.adminKey) console.warn("⚠ ADMIN_KEY no definida: el panel de administración permanecerá cerrado.");

const app = createApp(selectRepo(), { firebase: firebaseConfigured });
app.listen(config.port, () => console.log(`API en http://localhost:${config.port}`));
