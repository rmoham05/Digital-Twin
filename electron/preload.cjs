const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("twinOpsDesktop", {
  platform: process.platform,
});

