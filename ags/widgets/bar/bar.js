const hyprland = await Service.import("hyprland");
const notifications = await Service.import("notifications");
const mpris = await Service.import("mpris");
const audio = await Service.import("audio");
const systemtray = await Service.import("systemtray");

const FALLBACK_ICON = "audio-x-generic-symbolic";

const date = Variable("", {
  poll: [1000, 'date "+%H:%M %b %e, %Y"'],
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

function ClientTitle() {
  return Widget.Label({
    class_name: "client-title",
    label: hyprland.active.client.bind("title"),
  });
}

function Clock() {
  return Widget.Label({
    class_name: "clock",
    label: date.bind(),
  });
}

function Panel() {
  return Widget.Button({
    class_name: "workspaces",
    child: Widget.Box({
        children: [
            Volume(),
            Clock(),
        ]
    }),
    name: 'panel'
  });
}

// we don't need dunst or any other notification daemon
// because the Notifications module is a notification daemon itself
function Notification() {
  const popups = notifications.bind("popups");
  return Widget.Box({
    class_name: "notification",
    visible: popups.as((p) => p.length > 0),
    children: [
      Widget.Icon({
        icon: "preferences-system-notifications-symbolic",
      }),
      Widget.Label({
        label: popups.as((p) => p[0]?.summary || ""),
      }),
    ],
  });
}

function Media() {
  const label = Utils.watch("", mpris, "player-changed", () => {
    if (mpris.players[0]) {
      console.log(mpris.players[0]);
      const { track_artists, track_title } = mpris.players[0];
      return ` ${track_artists.join(", ")} - ${track_title}`;
    } else {
      return "Nothing is playing";
    }
  });

  const icon = Widget.Icon({
    class_name: "icon",
    hexpand: true,
    hpack: "end",
    vpack: "start",
    tooltip_text: mpris.getPlayer("")?.identity || "",
    icon: mpris
      .getPlayer("")
      ?.bind("entry")
      .transform((entry) => {
        const name = `${entry}-symbolic`;
        return Utils.lookUpIcon(name) ? name : FALLBACK_ICON;
      }),
    size: 10,
  });

  return Widget.Button({
    class_name: "media",
    on_primary_click: () => mpris.getPlayer("")?.playPause(),
    on_scroll_up: () => mpris.getPlayer("")?.next(),
    on_scroll_down: () => mpris.getPlayer("")?.previous(),
    child: Widget.Box({
      children: [
        // icon,
        Widget.Label({
          class_name: "title",
          label: label,
          xalign: 0,
          vpack: "center",
          truncate: "end",
        }),
      ],
    }),
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
    const icon = audio.speaker.is_muted
      ? 0
      : [101, 67, 34, 1, 0].find(
          (threshold) => threshold <= audio.speaker.volume * 100
        );

    return `audio-volume-${icons[icon]}-symbolic`;
  }

  const icon = Widget.Icon({
    icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    size: 20,
    name: 'volume'
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
        child: Widget.Icon({ icon: item.bind("icon"), size: 20 }),
        on_primary_click: (_, event) => item.activate(event),
        on_secondary_click: (_, event) => item.openMenu(event),
        tooltip_markup: item.bind("tooltip_markup"),
        class_name: "tray-icons",
      })
    )
  );

  return Widget.Box({
    children: items,
  });
}

// layout of the bar
function Left() {
  return Widget.Box({
    spacing: 8,
    children: [Media(), ClientTitle()],
    name: "left",
  });
}

function Center() {
  return Widget.Box({
    spacing: 8,
    children: [Workspaces(), Notification()],
    name: "center",
  });
}

function Right() {
  return Widget.Box({
    hpack: "end",
    spacing: 8,
    children: [SysTray(), Panel()],
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
};

export default () => {
  const bars = []
  hyprland.monitors.forEach(monitor => {
    print("monitor id: ", monitor.id);
    bars.push(Bar(monitor.id));
  });
  return bars;
}
