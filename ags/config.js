import Bar from './widgets/bar/bar.js'

App.config({
    style: "./style.css",
    windows: [
        Bar(0),
        Bar(1)
    ],
})

export { }