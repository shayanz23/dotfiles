import "lib/session"
import init from "lib/init"
import options from "options"
const hyprland = await Service.import("hyprland");
import Bars from "./widget/bar/bar.js";
import { setupQuickSettings } from "widget/quicksettings/QuickSettings"

App.addIcons(`${App.configDir}/assets`);



let windows = [];

hyprland.connect("monitor-added", () => {
  Utils.exec(App.configDir + "/launch.sh");
});

hyprland.connect("monitor-removed", () => {
  Utils.exec(App.configDir + "/launch.sh");
});

function configWindows() {
  windows.push(...Bars());
  for (let i = 0; i < windows.length; i++) {
    App.addWindow(windows[i]);
  }
}

App.config({
  onConfigParsed: () => {
    setupQuickSettings()
  },
  closeWindowDelay: {
    "quicksettings": options.transition.value,
  },
  style: "./style.css",
});
configWindows();