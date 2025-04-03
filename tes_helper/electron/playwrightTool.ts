import { createRequire } from "node:module";
import { BrowserWindow, screen } from "electron";
const require = createRequire(import.meta.url);
const { _electron } = require("playwright");

import { options } from "./main";
let electronApp: any = null;

export async function initToolWindow() {
  if (!electronApp) {
    electronApp = await _electron.launch(options);
  }

  const newWindow = await electronApp.firstWindow();

  const bwHandle = await electronApp.browserWindow(newWindow);
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  await bwHandle.evaluate(
    (currentWindow: BrowserWindow, { width, height }: { width: number; height: number }) => {
      currentWindow.setBounds({
        x: width / 2,
        y: 0,
        width: width / 2,
        height: height,
      });
    },
    { width, height },
  );
  return newWindow;
}

export async function destroyToolWindow() {
  await electronApp.close();
  electronApp = null;
}
