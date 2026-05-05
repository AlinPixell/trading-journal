const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const next = require("next");

const isDev = process.env.ELECTRON_START_URL === "1";
let server;

async function startNextServer() {
  const nextApp = next({ dev: false, dir: path.join(__dirname, "..") });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  server = http.createServer((req, res) => {
    handle(req, res);
  });

  await new Promise((resolve, reject) => {
    server.listen(3000, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 720,
    backgroundColor: "#0f0f0f",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const url = isDev ? "http://127.0.0.1:3000" : "http://127.0.0.1:3000";
  window.loadURL(url);
  window.removeMenu();
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (server) {
    server.close();
  }
});

app.whenReady().then(async () => {
  if (!isDev) {
    await startNextServer();
  }
  createWindow();
});
