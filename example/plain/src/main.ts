import { StorageClient } from "synced-storage/core";

import { init as initCookie } from "./cookie";
import { init as initLocalStorage } from "./local-storage";
import { init as initSessionStorage } from "./session-storage";

// Share a single StorageClient across storage-backed modules
const storageClient = new StorageClient();

initCookie();
initLocalStorage(storageClient);
initSessionStorage(storageClient);
