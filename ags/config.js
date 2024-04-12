import Bars from './widgets/bar/bar.js'

function configWindows() {
    const windows = []

    windows.push(Bars())
    
    App.config({
        style: "./style.css",
        windows: windows,
    })
}

configWindows();

export { }