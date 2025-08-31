import { browser } from "$app/environment";
import { init } from "$lib/auth/oidc/client.js";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async () => {
  if (browser) {
    await init();
  }
  return {};
};
