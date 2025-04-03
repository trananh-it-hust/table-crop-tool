import dayjs from "dayjs";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { helperLogin, clearCacheAndReload, getInfoUser, getListRoomBySite } from "./util/common";
import { initToolWindow, destroyToolWindow } from "./playwrightTool";
import { SPREADSHEET_ID, SHEET_NAME, GGGSHEET_API_KEY } from "./constant";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export const options: Record<string, unknown> =
  import.meta.env.MODE === "production"
    ? {
        executablePath: app.getPath("exe"),
      }
    : {
        args: ["."],
      };

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;

let window: any;
let win: BrowserWindow | null;

function createMainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    title: "My app",
    width: Math.floor(width * 0.5),
    height: height,
    x: 0,
    y: 0,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  return win;
}

async function cleanToolWindow() {
  if (window) {
    await window.close();
    window = null;
  }
}

ipcMain.on("sign-in", async (_e, opt) => {
  const { path } = opt;
  const match = path.match(/[^/]+(?=\.\w+$)/);
  const lastBackslashIndex = path.lastIndexOf("\\");
  const hotelName = match[0].substring(lastBackslashIndex + 1);

  if (!window) {
    window = await initToolWindow();
  } else {
    await clearCacheAndReload(window);
  }

  try {
    const userBeforeEncrypt = await getInfoUser(hotelName, SPREADSHEET_ID, SHEET_NAME, GGGSHEET_API_KEY);
    const isLogin = await helperLogin(window, userBeforeEncrypt.usernameOrEmail, userBeforeEncrypt.password);

    if (isLogin) {
      const listRoom = await getListRoomBySite(window);
      return win?.webContents.send("sign-in-success", { arrArrayIncludeUser: [], listRoom });
    }

    if (!isLogin) win?.webContents.send("fail:submit-form");
  } catch (error) {
    console.log(error);
    win?.webContents.send("fail:sign-in");
  }
});

ipcMain.on("submit-form", async () => {});

ipcMain.on("ResultView:confirm-data", async (_e, opt) => {
  const { listRoomNo, dataUpdate, startDate } = opt;
  if (listRoomNo.length === 0 || dataUpdate.length === 0) return;

  try {
    const startDay = dayjs(startDate).get("date");
    const startMonth = dayjs(startDate).get("month") + 1;
    const startYear = dayjs(startDate).get("year");
    const numberOfClick = (startYear - new Date().getFullYear()) * 12 + (startMonth - (new Date().getMonth() + 1));
    await window.waitForSelector(".icon-switch");

    await window.goto("https://tes.tidesquare.com/extranet/inventory/chargeblock");
    await window.waitForLoadState("domcontentloaded");

    for (const value of listRoomNo) {
      if (value == "") continue;
      const divSwitch = await window.locator("div.el-switch:has(span.el-switch__label.el-switch__label--left)");
      if ((await divSwitch.count()) > 0) {
        const checked = await divSwitch.first().evaluate((el: any) => el.classList.contains("is-checked"));
        if (!checked) {
          const toggleSpanSearch = await window.locator("div.inblock.w-100p.plr20 span.el-switch__core");
          await toggleSpanSearch.click();
        }
      }
      const input = await window.locator(`input.el-checkbox__original[value="${value}"]`);

      const spanLocator = await input.locator("..");
      if (spanLocator) await spanLocator.evaluate(async (span: any) => await span.click());
    }

    const nextMonthButton = await window.locator("span.calendar-nav-next");
    const previousMonthButton = await window.locator("span.calendar-nav-pre");
    for (let i = 1; i <= Math.abs(numberOfClick); i++) {
      if (numberOfClick < 0) {
        await previousMonthButton.click();
      } else {
        await nextMonthButton.click();
      }
    }
    const listDateInView = await window.locator("td div.text-center.pd.alink");
    await listDateInView.nth(startDay - 1).click();

    const buttonCheckRoom = await window.locator('button.el-button.fr.el-button--default.el-button--small >> span:text("조회")');
    await buttonCheckRoom.click();

    await window.waitForLoadState("load");

    await window.waitForSelector("div.el-collapse-item", { state: "visible", timeout: 10000 });
    const divElCollapseItems = await window.locator("div.el-collapse-item");

    const divCount = await divElCollapseItems.count();
    for (let i = 0; i < divCount; i++) {
      const divItem = divElCollapseItems.nth(i);
      const isDivDisable = await divItem.evaluate((el: any) => el.classList.contains("is-disabled"));
      if (isDivDisable) continue;

      const spanText = await divItem.locator("span.alink.el-tooltip.item").innerText();
      for (const room of dataUpdate) {
        if (spanText.trim().toUpperCase() === room.toRoom.toUpperCase().split("(")[0].trim()) {
          const iconElement = divItem.locator("i.fl.el-collapse-item__arrow.el-icon-arrow-right.alink");

          if ((await iconElement.count()) > 0) {
            await iconElement.click();
            await window.waitForSelector('div[role="tabpanel"] table.charge-block-table');
            const table = await divItem.locator(".el-collapse-item__wrap .charge-block-table").first();
            const spanChecked = await table.locator("span.el-checkbox__input");
            for (let j = 1; j <= room.status.length; j++) {
              const span = spanChecked.nth(j);
              const isSpanDisable = await span.evaluate((el: any) => el.classList.contains("is-disabled"));
              if (isSpanDisable) continue;
              const isChecked = await span.evaluate((el: any) => el.classList.contains("is-checked"));
              if (isChecked && room.status[j - 1] === 1) {
                await span.click();
              } else if (!isChecked && room.status[j - 1] === 0) {
                await span.click();
              }
            }
            break;
          }
        }
      }
    }
    win?.webContents.send("ResultView:confirm-data-success");
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.name === "TimeoutError") {
      win?.webContents.send("fail:update-charge-block", { message: "Không tìm thấy phòng, vui lòng kiểm tra lại" });
    } else {
      win?.webContents.send("fail:update-charge-block");
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    cleanToolWindow();
    destroyToolWindow();
    win = null;
  }
});

app.on("activate", () => {
  // if (BrowserWindow.getAllWindows().length === 0) {
  //   win = createMainWindow();
  // }
});

app.whenReady().then(() => {
  win = createMainWindow();
});
