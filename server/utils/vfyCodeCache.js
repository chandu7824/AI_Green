import nodeCache from "node-cache";

export const vfyCodeCache = new nodeCache({ stdTTL: 300 });
