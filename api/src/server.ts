import { env } from "./shared/config/env";
import { createApp } from "./shared/http/app";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
