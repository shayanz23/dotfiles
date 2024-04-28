const hyprland = await Service.import("hyprland");

App.addIcons(`${App.configDir}/assets`);

import Bars from "./widgets/bar/bar.js";

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
  style: "./style.css",
});
configWindows();
export {};
