function standBy () {
    JoyCar.stop(StopIntensity.Intense)
    JoyCar.brakelight(ToggleSwitch.On)
    JoyCar.hazardlights(ToggleSwitch.On)
    if (standByRuntime == 0) {
        standByRuntime = input.runningTime()
    }
    if (input.runningTime() - standByRuntime <= 2000) {
        basic.showLeds(`
            . # . # .
            . . . . .
            . . . . .
            # . . . #
            . # # # .
            `)
    } else {
        basic.showLeds(`
            . # # # .
            # . . . #
            . . . . .
            . # . # .
            . # . # .
            `)
        standByRuntime = 0
    }
}
function obstacleAvoidance () {
    JoyCar.brakelight(ToggleSwitch.Off)
    JoyCar.hazardlights(ToggleSwitch.Off)
    basic.showLeds(`
        . . # . .
        . . # . .
        . . # . .
        . . . . .
        # # # # #
        `)
    if (JoyCar.obstacleavoidance(SensorLRSelection.Left)) {
        JoyCar.stop(StopIntensity.Intense)
        JoyCar.brakelight(ToggleSwitch.On)
        basic.pause(200)
        JoyCar.brakelight(ToggleSwitch.Off)
        JoyCar.reversinglight(ToggleSwitch.On)
        JoyCar.drive(FRDirection.Reverse, 50)
        basic.pause(300)
        JoyCar.reversinglight(ToggleSwitch.Off)
        JoyCar.turn(FRDirection.Forward, LRDirection.Right, 40, 0)
        basic.pause(300)
    } else if (JoyCar.obstacleavoidance(SensorLRSelection.Right)) {
        JoyCar.stop(StopIntensity.Intense)
        JoyCar.brakelight(ToggleSwitch.On)
        basic.pause(200)
        JoyCar.brakelight(ToggleSwitch.Off)
        JoyCar.reversinglight(ToggleSwitch.On)
        JoyCar.drive(FRDirection.Reverse, 50)
        basic.pause(300)
        JoyCar.reversinglight(ToggleSwitch.Off)
        JoyCar.turn(FRDirection.Forward, LRDirection.Left, 40, 0)
        basic.pause(300)
    } else if (JoyCar.obstacleavoidance(SensorLRSelection.Left) && JoyCar.obstacleavoidance(SensorLRSelection.Right)) {
        JoyCar.stop(StopIntensity.Intense)
        JoyCar.brakelight(ToggleSwitch.On)
        basic.pause(200)
        JoyCar.brakelight(ToggleSwitch.Off)
        JoyCar.reversinglight(ToggleSwitch.On)
        JoyCar.drive(FRDirection.Reverse, 50)
        basic.pause(100)
        JoyCar.reversinglight(ToggleSwitch.Off)
        JoyCar.stop(StopIntensity.Soft)
        basic.pause(100)
        JoyCar.turn(FRDirection.Forward, LRDirection.Left, 40, 0)
        basic.pause(500)
        JoyCar.stop(StopIntensity.Soft)
        basic.pause(500)
    } else {
        JoyCar.drive(FRDirection.Forward, 50)
    }
}
input.onButtonPressed(Button.A, function () {
    if (menuMode < 2) {
        menuMode += 1
    } else {
        menuMode = 0
    }
})
function lineTracking () {
    JoyCar.brakelight(ToggleSwitch.Off)
    JoyCar.hazardlights(ToggleSwitch.Off)
    basic.showLeds(`
        # . # . #
        # . # . #
        # . # . #
        # . # . #
        # . # . #
        `)
    if (!(JoyCar.linefinder(SensorLCRSelection.Left)) && (!(JoyCar.linefinder(SensorLCRSelection.Center)) && !(JoyCar.linefinder(SensorLCRSelection.Right)))) {
        JoyCar.turn(FRDirection.Forward, LRDirection.Left, 50, 0)
    } else if (!(JoyCar.linefinder(SensorLCRSelection.Left)) && (!(JoyCar.linefinder(SensorLCRSelection.Center)) && JoyCar.linefinder(SensorLCRSelection.Right))) {
        JoyCar.turn(FRDirection.Forward, LRDirection.Right, 50, 0)
    } else if (!(JoyCar.linefinder(SensorLCRSelection.Left)) && (JoyCar.linefinder(SensorLCRSelection.Center) && !(JoyCar.linefinder(SensorLCRSelection.Right)))) {
        JoyCar.drive(FRDirection.Forward, 50)
    } else if (!(JoyCar.linefinder(SensorLCRSelection.Left)) && (JoyCar.linefinder(SensorLCRSelection.Center) && JoyCar.linefinder(SensorLCRSelection.Right))) {
        JoyCar.turn(FRDirection.Forward, LRDirection.Right, 50, 2)
    } else if (JoyCar.linefinder(SensorLCRSelection.Left) && (!(JoyCar.linefinder(SensorLCRSelection.Center)) && !(JoyCar.linefinder(SensorLCRSelection.Right)))) {
        JoyCar.turn(FRDirection.Forward, LRDirection.Left, 50, 0)
    } else if (JoyCar.linefinder(SensorLCRSelection.Left) && (!(JoyCar.linefinder(SensorLCRSelection.Center)) && JoyCar.linefinder(SensorLCRSelection.Right))) {
        JoyCar.stop(StopIntensity.Intense)
        JoyCar.brakelight(ToggleSwitch.On)
    } else if (JoyCar.linefinder(SensorLCRSelection.Left) && (JoyCar.linefinder(SensorLCRSelection.Center) && !(JoyCar.linefinder(SensorLCRSelection.Right)))) {
        JoyCar.turn(FRDirection.Forward, LRDirection.Left, 50, 2)
    } else if (JoyCar.linefinder(SensorLCRSelection.Left) && (JoyCar.linefinder(SensorLCRSelection.Center) && JoyCar.linefinder(SensorLCRSelection.Right))) {
        JoyCar.drive(FRDirection.Forward, FRDirection.Forward, 50)
    } else {
        JoyCar.stop(StopIntensity.Intense)
        JoyCar.brakelight(ToggleSwitch.On)
        JoyCar.hazardlights(ToggleSwitch.On)
    }
}
function hazardLights () {
    hazardRuntime = input.runningTime()
    while (input.runningTime() - hazardRuntime <= 2000) {
        JoyCar.hazardlights(ToggleSwitch.On)
    }
    JoyCar.hazardlights(ToggleSwitch.Off)
}
let hazardRuntime = 0
let standByRuntime = 0
let menuMode = 0
basic.showString("Hello!")
menuMode = 0
standByRuntime = 0
JoyCar.light(ToggleSwitch.On)
basic.pause(300)
JoyCar.light(ToggleSwitch.Off)
basic.pause(300)
JoyCar.light(ToggleSwitch.On)
basic.pause(1000)
JoyCar.light(ToggleSwitch.Off)
basic.pause(300)
JoyCar.brakelight(ToggleSwitch.On)
basic.pause(300)
JoyCar.brakelight(ToggleSwitch.Off)
basic.pause(300)
hazardLights()
JoyCar.buzzer(Melodies.Dadadadum, MelodyOptions.Once)
basic.forever(function () {
    if (menuMode == 0) {
        standBy()
    } else if (menuMode == 1) {
        obstacleAvoidance()
    } else if (menuMode == 2) {
        lineTracking()
    } else {
        menuMode = 0
    }
})
