/**
  * Enumeration of forward/reverse directions
  */
enum FRDirection {
    //% block="forward"
    Forward,
    //% block="reverse"
    Reverse
}

/**
  * Enumeration of forward/reverse/left/right directions
  */
enum FRLRDirection {
    //% block="forward"
    Forward,
    //% block="reverse"
    Reverse,
    //% block="left"
    Left,
    //% block="right"
    Right
}

/**
* Enumeration of left/right directions
*/
enum LRDirection {
    //% block="left"
    Left,
    //% block="right"
    Right
}

/**
* Enumeration of stop intensity
*/
enum StopIntensity {
    //% block="Intense"
    Intense,
    //% block="Soft"
    Soft
}

/**
* Enumeration of on/off toggle switches
*/
enum ToggleSwitch {
    //% block="on"
    On,
    //% block="off"
    Off
}

/**
* Enumeration of left/center/right sensors
*/
enum SensorLCRSelection {
    //% block="left"
    Left,
    //% block="center"
    Center,
    //% block="right"
    Right
}

/**
* Enumeration of left/right sensors
*/
enum SensorLRSelection {
    //% block="left"
    Left,
    //% block="right"
    Right
}


/**
* Enumeration of mainboard revisions
*/
enum RevisionMainboard {
    //% block="1.3"
    OnepThree,
    //% block="1.2"
    OnepTwo,
    //% block="< 1.2"
    OnepOne,
}

/**
* Enumeration of free IO Expander pins
*/
enum IOExpanderPin {
    //% block="0"
    Pin0,
    //% block="1"
    Pin1,
    //% block="7"
    Pin7,
}

/**
* Enumeration of compatible controller
*/
enum ControllerType{
    //% block="micro:bit"
    Microbit,
    //% block="Calliope"
    Calliope,
}

//% color="#275c6b" icon="\uf1b9" weight=95
namespace JoyCar {
    let ultrasonicEchoPin = DigitalPin.P12;
    const ultrasonicTriggerPin = DigitalPin.P8;
    let buzzerPin = DigitalPin.P16;
    let servoOnePin = AnalogPin.P1;
    let servoTwoPin = AnalogPin.P13;
    let adcPin = AnalogPin.P2;
    //  only relevant for revision 1.3
    let speedLeftPin = DigitalPin.P14
    let speedRightPin = DigitalPin.P15

    // Light Variables
    let strip = neopixel.create(DigitalPin.P0, 8, NeoPixelMode.RGB);

    let biasL = 100;
    let biasR = 100;

    // Global Light Settings
    let rev = 1.1;
    let lightGlobalInterval = 0;
    let lightIndicatorInterval = 0;
    let headlights = false;
    let breakLights = false;
    let reverseLight = false;
    let indicatorLeft = false;
    let indicatorRight = false;
    let hazard = false;

    let hazardBool = false;
    let indicatorLeftBool = false;
    let indicatorRightBool = false;

    //Motor init
    let pwmBuffer = pins.createBuffer(2);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 0);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, 1);
    pins.i2cWriteBuffer(112, pwmBuffer, false);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 232);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, 170);
    pins.i2cWriteBuffer(112, pwmBuffer, false);

    // Collision detection
    let servoAngles = [20, 45, 90, 135, 160];
    let lastServoPosition = servoAngles[0];
    let lastCollisionDetectionRuntime = 0;
    let obstacleDetected = false;

    /**
     * Set up your controller
    */
    //% block="Initialize your microcontroller %controller"
    //% revision.defl=ControllerType.Microbit
    //% subcategory=Essential
    //% weight=90
    export function initController(controller: ControllerType) {
        if (controller == ControllerType.Calliope) {
            buzzerPin = DigitalPin.P3;
        }
    }


    /**
     * Initialize Joy-Car
    */
    //% block="initialize Joy-Car with revision %revision"
    //% revision.defl=RevisionMainboard.OnepThree
    //% subcategory=Essential
    //% weight=90
    export function initJoyCar(revision: RevisionMainboard) {
        if (revision == RevisionMainboard.OnepOne) rev = 1.1;
        if (revision == RevisionMainboard.OnepTwo) rev = 1.2;
        if (revision == RevisionMainboard.OnepThree) rev = 1.3;
    }

    /**
     * ONLY FOR TOP MOUNTED ULTRASONIC-SENSOR WITH SERVO MOTOR. Rotates the ultrasonic sensor and returns true/false wether an obstacle was detected or not
     */
    //% block="Intelligent collision detection"
    //% subcategory="Smart functions"
    //% weight=100
    export function collisionDetection(): number {
        let distance = 0
        let nextServoPosition = servoAngles[0];
        if (input.runningTime() - lastCollisionDetectionRuntime >= 500) {
            if (!(lastServoPosition == servoAngles[servoAngles.length - 1])) {
                nextServoPosition = servoAngles[servoAngles.indexOf(lastServoPosition) + 1];
            }

            // Check sonar distance to obstacle
            distance = sonar();

            // Move servo to next position
            servo(1, nextServoPosition);
            lastServoPosition = nextServoPosition;
            lastCollisionDetectionRuntime = input.runningTime();

            // Determine if obstacle is too close
            if (distance > 100) {
                obstacleDetected = false;
            }
            else {
                obstacleDetected = true;
            }
        }

        if (obstacleDetected) {
            if (servoAngles.indexOf(lastServoPosition) - 1 == 2 || servoAngles.indexOf(lastServoPosition) - 1 == 3) return 1
            if (servoAngles.indexOf(lastServoPosition) - 1 == -1 || servoAngles.indexOf(lastServoPosition) - 1 == 0) return 3
            if (servoAngles.indexOf(lastServoPosition) - 1 == 1) return 2
            return 0
        }
        else {
            return 0
        }
    }

    /**
     * Move Joy-Car forward or backwards with speed
     */
    //% block="drive%direction|at %speed|\\%"
    //% subcategory=Motors
    //% weight=90
    //% speed.min=0 speed.max=100
    export function drive(direction: FRLRDirection, speed: number) {
        let pwmSpeed = 255 * (speed / 100);
        pwmSpeed = Math.round(pwmSpeed);
        if (direction == FRLRDirection.Forward) {
            driveJoyCar(0, pwmSpeed, 0, pwmSpeed);
        }
        if (direction == FRLRDirection.Reverse) {
            driveJoyCar(pwmSpeed, 0, pwmSpeed, 0);
        }
        if (direction == FRLRDirection.Left) {
            driveJoyCar(0, pwmSpeed, pwmSpeed, 0);
        }
        if (direction == FRLRDirection.Right) {
            driveJoyCar(pwmSpeed, 0, 0, pwmSpeed);
        }
    }

    /**
     * Move Joy-Car left or right. The higher the radius, the wider the curve will be.
     */
    //% block="drive%orientation %direction |at %speed| with radius-level %radius"
    //% subcategory=Motors
    //% weight=80
    //% speed.min=0 speed.max=100
    //% radius.min=0 radius.max=5
    export function turn(orientation: FRDirection, direction: LRDirection, speed: number, radius: number) {
        let pwmSpeed = 255 * (speed / 100);
        pwmSpeed = Math.round(pwmSpeed);
        let innerWheelSpeed = 0;
        if (radius > 0) {
            // Set proportional wheelspeed if radius is > 0
            innerWheelSpeed = (pwmSpeed * 0.7) * (radius / 5);
        }

        if (orientation == FRDirection.Forward) {
            //Forwards
            if (direction == LRDirection.Left) {
                driveJoyCar(0, pwmSpeed, 0, innerWheelSpeed);
            }
            else {
                driveJoyCar(0, innerWheelSpeed, 0, pwmSpeed);
            }
        }
        else {
            // Backwards
            if (direction == LRDirection.Left) {
                driveJoyCar(pwmSpeed, 0, innerWheelSpeed, 0);
            }
            else {
                driveJoyCar(innerWheelSpeed, 0, pwmSpeed, 0);
            }
        }


    }

    /**
     * Stop the motors.
     */
    //% block="Stop motors%intensity"
    //% subcategory=Motors
    //% weight=70
    export function stop(intensity: StopIntensity) {
        if (intensity == StopIntensity.Intense) {
            // Hard stop with PWM on all channels to 0
            driveJoyCar(0, 0, 0, 0);
        }
        else {
            // Soft stop with PWM on all channels to 255
            driveJoyCar(255, 255, 255, 255);
        }
    }

    /**
     * Control servo motors
     */
    //% block="Set servo no. %sensor to %angle degrees"
    //% subcategory=Motors
    //% weight=60
    //% servo.min=1 servo.max=2 servo.defl=1
    //% angle.min=0 angle.max=180 angle.defl=90
    export function servo(servo: number, angle: number) {
        if (servo == 1) {
            pins.servoWritePin(servoOnePin, angle);
        }
        else {
            pins.servoWritePin(servoTwoPin, angle);
        }
    }

    /**
     * Set Bias for Motors
     */
    //% block="bias %direction by %percent"
    //% subcategory=Motors
    //% weight=50
    //% percent.min=0 percent.max=100
    export function bias(direction: LRDirection, percent: number) {
        if (direction == LRDirection.Left) {
            biasL = scale(percent, 0, 100, 100, 0);
        }
        else if (direction == LRDirection.Right) {
            biasR = scale(percent, 0, 100, 100, 0);
        }
    }

    /**
      * Drive with PWM signal
      */
    //% block="Drive with PWM signals on channel 2 %ch2, channel 3 %ch3, channel 4 %ch4, channel 5 %ch5"
    //% subcategory=Motors
    //% weight=40
    //% ch2.min=0 ch2.max=255
    //% ch3.min=0 ch3.max=255
    //% ch4.min=0 ch4.max=255
    //% ch5.min=0 ch5.max=255
    export function drivePwm(ch2: number, ch3: number, ch4: number, ch5: number) {
        driveJoyCar(ch2, ch3, ch4, ch5);
    }

    /**
     * Turn on/off the front light
     */
    //% block="Toggle light%toggle"
    //% subcategory=LEDs
    //% weight=100
    export function light(toggle: ToggleSwitch) {
        if (toggle == ToggleSwitch.On) {
            headlights = true;
        }
        else {
            headlights = false;
        }
        setLights();
    }

    /**
     * Turn on/off the brake light
     */
    //% block="Toggle brakelight%toggle"
    //% subcategory=LEDs
    //% weight=90
    export function brakelight(toggle: ToggleSwitch) {
        if (toggle == ToggleSwitch.On) {
            breakLights = true;
        }
        else {
            breakLights = false;
        }
        setLights();
    }

    /**
     * Turn on/off left/right indicator
     */
    //% block="Turn %toggle %selection indicator"
    //% subcategory=LEDs
    //% weight=80
    export function indicator(toggle: ToggleSwitch, selection: SensorLRSelection) {
        if (toggle == ToggleSwitch.On) {
            if (selection == SensorLRSelection.Left) {
                indicatorLeft = true;
            }
            if (selection == SensorLRSelection.Right) {
                indicatorRight = true;
            }
        }
        else {
            if (selection == SensorLRSelection.Left) {
                indicatorLeft = false;
            }
            if (selection == SensorLRSelection.Right) {
                indicatorRight = false;
            }
        }
        setLights();
    }

    /**
     * Turn on/off hazard lights
     */
    //% block="Turn %toggle hazard lights"
    //% subcategory=LEDs
    //% weight=70
    export function hazardlights(toggle: ToggleSwitch) {
        if (toggle == ToggleSwitch.On) {
            hazard = true;
        }
        else {
            hazard = false;
        }
        setLights();
    }

    /**
     * Turn on/off reverse light
     */
    //% block="Toggle reverse light%toggle"
    //% subcategory=LEDs
    //% weight=60
    export function reversinglight(toggle: ToggleSwitch) {
        if (toggle == ToggleSwitch.On) {
            reverseLight = true;
        }
        else {
            reverseLight = false;
        }
        setLights();
    }

    /**
     * Check sonar
     */
    //% block="Check ultrasonic-sensor"
    //% subcategory=Sensors
    //% weight=100
    export function sonar() {
        let duration = 0;
        pins.digitalWritePin(ultrasonicTriggerPin, 0);
        control.waitMicros(10);
        pins.digitalWritePin(ultrasonicTriggerPin, 1);
        duration = pins.pulseIn(ultrasonicEchoPin, PulseValue.High);
        return (duration / 58.2);
    }

    /**
     * Check left/center/right linefinder-sensor
     */
    //% block="Check %selection linefinder-sensor"
    //% subcategory=Sensors
    //% weight=90
    export function linefinder(selection: SensorLCRSelection) {
        if (selection == SensorLCRSelection.Left) {
            return sensorData(2);
        }
        else if (selection == SensorLCRSelection.Center) {
            return sensorData(3);
        }
        else {
            return sensorData(4);
        }
    }

    /**
     * Check left/right obstacle-sensor
     */
    //% block="Check %selection obstacle-sensor"
    //% subcategory=Sensors
    //% weight=80
    export function obstacleavoidance(selection: SensorLRSelection) {
        if (selection == SensorLRSelection.Left) {
            return sensorData(5);
        }
        else {
            return sensorData(6);
        }
    }

    /**
     * Check left/right speed-sensor
     */
    //% block="Check %selection speed-sensor"
    //% subcategory=Sensors
    //% weight=70
    export function speed(selection: SensorLRSelection) {
        if (rev >= 1.3) {
            if (selection == SensorLRSelection.Left) {
                return pins.digitalReadPin(speedLeftPin);
            }
            else {
                return pins.digitalReadPin(speedRightPin);
            }
        }
        else {
            if (selection == SensorLRSelection.Left) {
                return sensorData(0);
            }
            else {
                return sensorData(1);
            }
        }
    }

    /**
     * Setup buzzer on Joy-Car
     */
    //% block="setup horn on Joy-Car"
    //% subcategory="Additional Functions"
    //% weight=100
    export function setup_buzzer(): void {
        pins.analogSetPitchPin(buzzerPin);
    }

    /**
      * ADC Input Voltage
      */
    //% block="Read Input Voltage"
    //% subcategory="Additional Functions"
    //% weight=90
    export function readAdc() {
        let uref = 0.00322265625;
        let uratio = 2.7857142;

        let adcvoltage = pins.analogReadPin(adcPin);
        return (uref * adcvoltage * uratio);
    }

    /**
        * ONLY REVISION 1.3 OR NEWER can use Pin 0 and Pin 1 - Write data (Pin 7) on IO expander
        */
    //% block="Write on Pin %pin of the IO expander with %value"
    //% subcategory="Additional Functions"
    //% weight=70
    //% value.min=0 value.max=1 value.defl=1
    export function writeIOExpander(pin: IOExpanderPin, value: number) {
        let expander_state = pins.i2cReadNumber(56, NumberFormat.UInt8LE, false);
        let expanderBuffer = pins.createBuffer(1);
        if (rev >= 1.3) {
            if (pin == IOExpanderPin.Pin0) {
                if (value == 1) expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, expander_state | 0x01 | 0x7C);
                else expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, (expander_state & 0xFE) | 0x7C);
            }
            if (pin == IOExpanderPin.Pin1) {
                if (value == 1) expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, expander_state | 0x02 | 0x7C);
                else expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, (expander_state & 0xFD) | 0x7C);
            }
            if (pin == IOExpanderPin.Pin7) {
                if (value == 1) expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, expander_state | 0x80 | 0x7C);
                else expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, (expander_state & 0x7F) | 0x7C);
            }
        }
        else {
            if (pin == IOExpanderPin.Pin7) {
                if (value == 1) expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, expander_state | 0x80 | 0x7F);
                else expanderBuffer.setNumber(NumberFormat.UInt8LE, 0, (expander_state & 0x7F) | 0x7F);
            }
        }
        pins.i2cWriteBuffer(56, expanderBuffer, false);
    }

    /**
        * Read data from IO expander
        */
    //% block="Read data from IO expander"
    //% subcategory="Additional Functions"
    //% weight=80
    export function readIOExpander() {
        return getDataIOExpander()
    }

    // ------------------------------------------------------------
    
    // Light controller
    function setLights() {
        // Check last execution time to filter multiple execution bounces
        if (input.runningTime() - lightGlobalInterval >= 50) {
            strip.setPixelColor(0, 0x000000);
            strip.setPixelColor(1, 0x000000);
            strip.setPixelColor(2, 0x000000);
            strip.setPixelColor(3, 0x000000);
            strip.setPixelColor(4, 0x000000);
            strip.setPixelColor(5, 0x000000);
            strip.setPixelColor(6, 0x000000);
            strip.setPixelColor(7, 0x000000);

            if (headlights) {
                strip.setPixelColor(0, 0x808080);
                strip.setPixelColor(3, 0x808080);
                strip.setPixelColor(5, 0x500000);
                strip.setPixelColor(6, 0x500000);
            }
            if (breakLights) {
                strip.setPixelColor(5, 0xff0000);
                strip.setPixelColor(6, 0xff0000);
            }
            if (reverseLight) {
                strip.setPixelColor(6, 0x808080);
            }

            if (hazard || indicatorLeft || indicatorRight) {
                if (indicatorLeft) {
                    if (!indicatorLeftBool) {
                        strip.setPixelColor(1, 0xff7200);
                        strip.setPixelColor(4, 0xff7200);
                        strip.setPixelColor(2, 0x000000);
                        strip.setPixelColor(7, 0x000000);
                        if (input.runningTime() - lightIndicatorInterval >= 400) {
                            indicatorLeftBool = true;
                            lightIndicatorInterval = input.runningTime();
                        }
                    }
                    else {
                        strip.setPixelColor(1, 0x000000);
                        strip.setPixelColor(4, 0x000000);
                        strip.setPixelColor(2, 0x000000);
                        strip.setPixelColor(7, 0x000000);
                        if (input.runningTime() - lightIndicatorInterval >= 400) {
                            indicatorLeftBool = false;
                            lightIndicatorInterval = input.runningTime();
                        }
                    }
                }
                else if (indicatorRight) {
                    if (!indicatorRightBool) {
                        strip.setPixelColor(2, 0xff7200);
                        strip.setPixelColor(7, 0xff7200);
                        strip.setPixelColor(1, 0x000000);
                        strip.setPixelColor(4, 0x000000);
                        if (input.runningTime() - lightIndicatorInterval >= 400) {
                            indicatorRightBool = true;
                            lightIndicatorInterval = input.runningTime();
                        }
                    }
                    else {
                        strip.setPixelColor(2, 0x000000);
                        strip.setPixelColor(7, 0x000000);
                        strip.setPixelColor(1, 0x000000);
                        strip.setPixelColor(4, 0x000000);
                        if (input.runningTime() - lightIndicatorInterval >= 400) {
                            indicatorRightBool = false;
                            lightIndicatorInterval = input.runningTime();
                        }
                    }
                }
                else if (hazard) {
                    if (!hazardBool) {
                        strip.setPixelColor(1, 0xff7200);
                        strip.setPixelColor(2, 0xff7200);
                        strip.setPixelColor(4, 0xff7200);
                        strip.setPixelColor(7, 0xff7200);
                        if (input.runningTime() - lightIndicatorInterval >= 400) {
                            hazardBool = true;
                            lightIndicatorInterval = input.runningTime();
                        }
                    }
                    else {
                        strip.setPixelColor(1, 0x000000);
                        strip.setPixelColor(2, 0x000000);
                        strip.setPixelColor(4, 0x000000);
                        strip.setPixelColor(7, 0x000000);
                        if (input.runningTime() - lightIndicatorInterval >= 400) {
                            hazardBool = false;
                            lightIndicatorInterval = input.runningTime();
                        }
                    }
                }
            }

            lightGlobalInterval = input.runningTime();
        }

        strip.show();
    }

    // Drive controller
    function driveJoyCar(ch2: number, ch3: number, ch4: number, ch5: number) {
        // Map PWM numbers to working range of motors
        if (ch2 > 0) {
            ch2 = ch2 * (biasR / 100);
            ch2 = scale(ch2, 0, 255, 80, 255);
        }
        if (ch3 > 0) {
            ch3 = ch3 * (biasR / 100);
            ch3 = scale(ch3, 0, 255, 80, 255);
        }
        if (ch4 > 0) {
            ch4 = ch4 * (biasL / 100);
            ch4 = scale(ch4, 0, 255, 80, 255);
        }
        if (ch5 > 0) {
            ch5 = ch5 * (biasL / 100);
            ch5 = scale(ch5, 0, 255, 80, 255);
        }
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 2);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, ch2);
        pins.i2cWriteBuffer(112, pwmBuffer, false);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 3);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, ch3);
        pins.i2cWriteBuffer(112, pwmBuffer, false);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 4);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, ch4);
        pins.i2cWriteBuffer(112, pwmBuffer, false);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 5);
        pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, ch5);
        pins.i2cWriteBuffer(112, pwmBuffer, false);
    }

    // Read from IO Expander
    function getDataIOExpander() {
        let expander = pins.i2cReadNumber(56, NumberFormat.UInt8LE, false);
        let bin = ""

        let byte = pins.createBuffer(1);
        byte.setNumber(NumberFormat.Int8LE, 0, expander);

        for (let i = 0; i < 8; i++) {
            bin += ((byte[0] >> i) & 1).toString();
        }
        
        if (rev >= 1.3) {
            bin = bin.slice(2) + bin.slice(0, 2);
            bin = pins.digitalReadPin(speedLeftPin).toString() + pins.digitalReadPin(speedRightPin).toString() + bin;
        }
        return bin
    }

    function sensorData(channel: number) {
        let data = getDataIOExpander()
        return !parseInt(data[channel])
    }

    // Mapping function
    function scale(num: number, in_min: number, in_max: number, out_min: number, out_max: number) {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}
