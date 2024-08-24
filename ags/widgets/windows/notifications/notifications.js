import { mediaWidget } from "../../media/media-widget.js";

export default function () {
    const box = Widget.Box(
        { 
            name: "dateBox",
            child: mediaWidget(),
        }
    )   

    const window = Widget.Window({
        name: "dateWindow",
        anchor: ["top"],
        child: box,
        visible: false,
        keymode: 'exclusive',
        layer: 'top',
    });

    window.on("key-press-event", (self, event) => {
        // check event for keys
        if (window.visible === true) {
            window.visible = false;
        }
    });

    // box.on("clicked", self => {
    //     print(self, "is clicked")
    // });

    return window;
}
