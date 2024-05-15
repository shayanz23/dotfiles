const hyprland = await Service.import("hyprland");
const notifications = await Service.import("notifications");
const mpris = await Service.import("mpris");
const audio = await Service.import("audio");
const systemtray = await Service.import("systemtray");
const bluetooth = await Service.import("bluetooth");
const network = await Service.import("network");

const FALLBACK_ICON = "audio-x-generic-symbolic";

const date = Variable("", {
  poll: [1000, 'date "+%a %b %e   %H:%M"'],
});

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Workspaces() {
  const activeId = hyprland.active.workspace.bind("id");
  const workspaces = hyprland.bind("workspaces").as((ws) =>
    ws.map(({ id }) =>
      Widget.Button({
        on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
        child: Widget.Label(`${id}`),
        class_name: activeId.as((i) => `${i === id ? "focused" : ""}`),
      })
    )
  );

  return Widget.Box({
    class_name: "workspaces",
    children: workspaces,
  });
}

const WifiIndicator = () =>
  Widget.Icon({
    icon: network.wifi.bind("icon_name"),
    size: 19,
  });

const WiredIndicator = () => {
  return Widget.Icon({
    icon: network.wired.bind("icon_name"),
    size: 19,
  });
};

const NetworkIndicator = () => {
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
  return Widget.Label({
    class_name: "client-title",
    label: hyprland.active.client.bind("title"),
    truncate: "end",
    max_width_chars: 60,
    name: "current-title",
  });
}

function Date() {
  return Widget.Button({
    class_name: "clock",
    label: date.bind(),
  });
}

function QSettings() {
  return Widget.Button({
    // on_primary_click: () => audio.volume,
    on_clicked: () => App.toggleWindow("quicksettings"),
    on_scroll_up: () => Utils.exec("swayosd-client --output-volume +5"),
    on_scroll_down: () => Utils.exec("swayosd-client --output-volume -5"),
    class_name: "panel",
    child: Widget.Box({
      children: [Volume(), btIndicator(), NetworkIndicator()],
    }),
    name: "q-settings",
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

  const icon = Widget.Icon({
    icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    size: 19,
    name: "volume",
  });

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
      Widget.Button({
        child: Widget.Icon({ icon: item.bind("icon"), size: 21 }),
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event),
        tooltip_markup: item.bind("tooltip_markup"),
        class_name: "tray-icons",
      })
    )
  );

  return Widget.Box({
    children: items,
    name: "tray",
  });
}

// layout of the bar
function Left() {
  const box = Widget.Box({
    spacing: 8,
    children: [Workspaces(), ClientTitle()],
    name: "left-child",
  });
  return Widget.Box({
    children: [box],
    name: "left",
  });
}

function Center() {
  return Widget.Box({
    spacing: 8,
    children: [Date()],
    name: "center",
  });
}

function Right() {
  return Widget.Box({
    hpack: "end",
    spacing: 8,
    children: [SysTray(), QSettings()],
    name: "right",
  });
}

function Bar(monitor = 0) {
  return Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    class_name: "bar",
    monitor,
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
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
    print("monitor id: ", monitor.id);
    bars.push(Bar(monitor.id));
  });
  return bars;
};
