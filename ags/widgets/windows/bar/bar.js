const mpris = await Service.import("mpris");
const players = mpris.bind("players");

// @ts-ignore
const hyprland = await Service.import("hyprland");
// @ts-ignore
const notifications = await Service.import("notifications");
// @ts-ignore
const audio = await Service.import("audio");
// @ts-ignore
const systemtray = await Service.import("systemtray");
// @ts-ignore
const bluetooth = await Service.import("bluetooth");
// @ts-ignore
const network = await Service.import("network");

// @ts-ignore
const date = Variable("", {
  poll: [1000, 'date "+%a %b %e  %H:%M"'],
});

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Workspaces() {
  const activeId = hyprland.active.workspace.bind("id");
  const workspaces = hyprland.bind("workspaces").as((ws) =>
    ws.map(({ id }) =>
      // @ts-ignore
      Widget.Button({
        on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
        // @ts-ignore
        child: Widget.Label(`${id}`),
        class_name: activeId.as((i) => `${i === id ? "focused" : ""}`),
      })
    )
  );

  // @ts-ignore
  return Widget.Box({
    class_name: "workspaces",
    children: workspaces,
  });
}

const WifiIndicator = () =>
  // @ts-ignore
  Widget.Icon({
    icon: network.wifi.bind("icon_name"),
    size: 19,
  });

const WiredIndicator = () => {
  // @ts-ignore
  return Widget.Icon({
    icon: network.wired.bind("icon_name"),
    size: 19,
  });
};

const NetworkIndicator = () => {
  // @ts-ignore
  return Widget.Stack({
    children: {
      wifi: WifiIndicator(),
      wired: WiredIndicator(),
    },
    shown: network.bind("primary").as((p) => p || "wifi"),
    name: "ntw-ind",
  });
};

function btIndicator() {
  // @ts-ignore
  const indicator = Widget.Icon({
    icon: bluetooth
      .bind("enabled")
      .as((on) => `bluetooth-${on ? "active" : "disabled"}-symbolic`),
    name: "bt-indicator",
    size: 19,
  });
  return indicator;
}

function ClientTitle() {
  // @ts-ignore
  return Widget.Label({
    class_name: "client-title",
    label: hyprland.active.client.bind("title"),
    truncate: "end",
    max_width_chars: 60,
    name: "current-title",
  });
}

function Notifications() {
  let notRingedIcon = Widget.Icon({
    icon: "notifications-symbolic-not-ringing",
    size: 19,
  });

  let ringedIcon = Widget.Icon({
    icon: "notifications-symbolic-ringing",
    size: 19,
  });

  let notiIcon = Widget.Stack({
    name: "notiIcon",
    children: {
      unringed: notRingedIcon,
      ringed: ringedIcon,
    },
    shown: "unringed",
  });

  if (notifications.notifications.length > 0) {
    notiIcon.shown = 'ringed'
  }

  notifications.connect("changed", () => {
    if (notifications.notifications.length > 0) {
      notiIcon.shown = "ringed";

    } else {
      notiIcon.shown = "unringed";
    }

  });

  let dateLabel = Widget.Label({
    label: date.bind(),
  });

  // @ts-ignore
  return Widget.Button({
    name: "date",
    on_clicked: () => {
      App.toggleWindow("dateWindow");
    },
    child: Widget.Box({
      children: [dateLabel, notiIcon],
    }),
  });
}

function SystemPanel() {
  // @ts-ignore
  return Widget.Button({
    // on_primary_click: () => audio.volume,
    // @ts-ignore
    on_scroll_up: () => Utils.exec("swayosd-client --output-volume +5"),
    // @ts-ignore
    on_scroll_down: () => Utils.exec("swayosd-client --output-volume -5"),
    class_name: "panel",
    // @ts-ignore
    child: Widget.Box({
      children: [Volume(), btIndicator(), NetworkIndicator()],
    }),
    name: "panel",
  });
}

function Volume() {
  const icons = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted",
  };

  function getIcon() {
    if (audio.speaker.description === "USB Audio Front Headphones") {
      return "audio-headphones-symbolic";
    } else {
      const icon = audio.speaker.is_muted
        ? 0
        : [101, 67, 34, 1, 0].find(
            (threshold) => threshold <= audio.speaker.volume * 100
          );

      return `audio-volume-${icons[icon]}-symbolic`;
    }
  }

  // @ts-ignore
  const icon = Widget.Icon({
    // @ts-ignore
    icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    size: 19,
    name: "volume",
  });

  // @ts-ignore
  const slider = Widget.Slider({
    hexpand: true,
    draw_value: false,
    on_change: ({ value }) => (audio.speaker.volume = value),
    setup: (self) =>
      self.hook(audio.speaker, () => {
        self.value = audio.speaker.volume || 0;
      }),
  });

  return icon;
}

function SysTray() {
  const items = systemtray.bind("items").as((items) =>
    items.map((item) =>
      // @ts-ignore
      Widget.Button({
        // @ts-ignore
        child: Widget.Icon({ icon: item.bind("icon"), size: 21 }),
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event),
        tooltip_markup: item.bind("tooltip_markup"),
        class_name: "tray-icons",
      })
    )
  );

  // @ts-ignore
  return Widget.Box({
    children: items,
    name: "tray",
  });
}

// layout of the bar
function Left() {
  // @ts-ignore
  const box = Widget.Box({
    spacing: 8,
    children: [Workspaces(), ClientTitle()],
    name: "left-child",
  });
  // @ts-ignore
  return Widget.Box({
    children: [box],
    name: "left",
  });
}

function Center() {
  // @ts-ignore
  return Widget.Box({
    spacing: 8,
    children: [Notifications()],
    name: "center",
  });
}

function Right() {
  // @ts-ignore
  return Widget.Box({
    hpack: "end",
    spacing: 8,
    children: [SysTray(), SystemPanel()],
    name: "right",
  });
}

function Bar(monitor = 0) {
  // @ts-ignore
  return Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    // @ts-ignore
    child: Widget.CenterBox({
      start_widget: Left(),
      center_widget: Center(),
      end_widget: Right(),
    }),
  });
}

export default () => {
  const bars = [];
  hyprland.monitors.forEach((monitor) => {
    // @ts-ignore
    print("monitor id: ", monitor.id);
    bars.push(Bar(monitor.id));
  });
  return bars;
};
