import { getDataFromSheet } from "./ggSheet";
import { createRequire } from "node:module";
import { BrowserWindow } from "electron";
import { HOTEL_URL_LOGIN } from "../constant";
import { getListRoom } from "../service/getTESData";
import CryptoJS from "crypto-js";

const require = createRequire(import.meta.url);
const { _electron } = require("playwright");
let electronApp: any = null;

export async function initToolWindow(windowOptions?: { width: 200; height: 200 }) {
  if (!electronApp) electronApp = await _electron.launch({ args: ["../main.ts"] });
  const newWindow = await electronApp.firstWindow();
  const bwHandle = await electronApp.browserWindow(newWindow);
  if (windowOptions) {
    const { width, height } = windowOptions;
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
}

export async function getSessionStorageByBrowser(window: any) {
  const sessionStorageData = await window.evaluate(() => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key: any = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      data[key] = value;
    }
    return data;
  });
  return sessionStorageData;
}

export async function helperLogin(window: any, username: string, password: string) {
  let isLogin = true;
  console.log(username, password);
  try {
    await window.goto(HOTEL_URL_LOGIN);
    await window.waitForLoadState("domcontentloaded");
    await window.fill('input[placeholder="Username"].form-control', username);
    await window.fill('input[placeholder="Password"].form-control', password);

    await window.click('button[type="submit"]');
    await window.waitForLoadState("networkidle");
  } catch (error) {
    console.log(error);
    isLogin = false;
  }
  return isLogin;
}

export async function clearCacheAndReload(window: any) {
  try {
    await window.evaluate(() => {
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => caches.delete(key)));
      });
      sessionStorage.clear();
    });
    await window.context().clearCookies();
  } catch (error) {
    console.error("Error clearing cache or reloading the page:", error);
  }
}

export async function getInfoUser(hotelName: string, spreadSheetId: string, sheetName: string, ggSheetApiKey: string) {
  const dataSheet = await getDataFromSheet(spreadSheetId, sheetName, ggSheetApiKey);
  const user = {
    usernameOrEmail: "",
    password: "",
    systemCode: "S02",
  };
  dataSheet.values.forEach((item: any) => {
    item.forEach((i: any) => {
      if (i.includes(hotelName)) {
        user.usernameOrEmail = item[4];
        user.password = item[4].split("@")[0];
      }
    });
  });
  return user;
}

export async function getListRoomBySite(window: any) {
  const sessionStorage = await getSessionStorageByBrowser(window);
  const accessToken = sessionStorage["accessToken"];
  const userInfo = JSON.parse(sessionStorage["userInfo"]);
  const userId = CryptoJS.AES.encrypt(userInfo.encryptEmail, "tavi@polarium.co.kr").toString();
  const listRoom = await getListRoom(accessToken, CryptoJS.AES.encrypt(userInfo?.facilityNo, "tavi@polarium.co.kr").toString(), userId);
  return listRoom;
}
