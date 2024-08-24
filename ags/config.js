const hyprland = await Service.import("hyprland");
const notifications = await Service.import("notifications");
import { NotificationPopups } from "./widgets/windows/notification-popups/notificationPopups.js"

App.addIcons(`${App.configDir}/assets`);

import Bars from "./widgets/windows/bar/bar.js";
import notifsWindow from "./widgets/windows/notifications/notifications.js";

let windows = [];

hyprland.connect("monitor-added", () => {
  Utils.exec(App.configDir + "/launch.sh");
});

hyprland.connect("monitor-removed", () => {
  Utils.exec(App.configDir + "/launch.sh");
});



function configWindows() {
  windows.push(...Bars());
  windows.push(notifsWindow());
  windows.push(NotificationPopups());
  for (let i = 0; i < windows.length; i++) {
    App.addWindow(windows[i]);
    if (windows[i].class_name === "bar") {
      if (notifications.notifications.length > 0) {
        windows[i].child.center_widget.children[0].child.children[1].shown = "ringed";
      }
    }
  }
}

App.config({
  style: "./style.css",
});
configWindows();
export {};
