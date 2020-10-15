/**
  * Enumeration of forward/reverse directions
  */
enum FRDirection
{
    //% block="forward"
    Forward,
    //% block="reverse"
    Reverse
}



/**
  * Enumeration of left/right directions
  */
enum LRDirection
{
    //% block="left"
    Left,
    //% block="right"
    Right
}

/**
  * Enumeration of stop intensity
  */
enum StopIntensity
{
  //% block="Intense"
  Intense,
  //% block="Soft"
  Soft
}

/**
 * Enumeration of on/off toggle switches
 */
enum ToggleSwitch
{
    //% block="on"
    On,
    //% block="off"
    Off
}

/**
 * Enumeration of left/center/right sensors
 */
enum SensorLCRSelection
{
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
enum SensorLRSelection
{
    //% block="left"
    Left,
    //% block="right"
    Right
}

//% color="#275c6b" icon="\uf1b9" weight=95
namespace JoyCar {
    // Light Variables
    let strip = neopixel.create(DigitalPin.P0, 8, NeoPixelMode.RGB);
    let lastIndicator = 0;
    let indicatorBool = false;
    let lastHazard = 0;
    let hazardBool = false;
    let biasL = 100;
    let biasR = 100;

    //Motor init
    let pwmBuffer = pins.createBuffer(2);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 0);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, 1);
    pins.i2cWriteBuffer(112, pwmBuffer, false);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 0, 232);
    pwmBuffer.setNumber(NumberFormat.UInt8LE, 1, 170);
    pins.i2cWriteBuffer(112, pwmBuffer, false);

    /**
     * Move Joy-Car forward or backwards with speed
     */
    //% block="drive%direction|at %speed|\\%"
    //% subcategory=Motors
    //% weight=90
    //% speed.min=0 speed.max=100
    export function drive(direction: FRDirection, speed: number) {
      let pwmSpeed = 255 * (speed/100);
      pwmSpeed = Math.round(pwmSpeed);
      if(direction == FRDirection.Forward){
        driveJoyCar(0, pwmSpeed, 0, pwmSpeed);
      }
      else {
        driveJoyCar(pwmSpeed, 0, pwmSpeed, 0);
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
      let pwmSpeed = 255 * (speed/100);
      pwmSpeed = Math.round(pwmSpeed);
      let innerWheelSpeed = 0;
      if(radius > 0){
        // Set proportional wheelspeed if radius is > 0
        innerWheelSpeed = (pwmSpeed * 0.7) * (radius/5);
      }

      if(orientation == FRDirection.Forward){
        //Forwards
        if(direction == LRDirection.Left){
            driveJoyCar(0, pwmSpeed, 0, innerWheelSpeed);
        }
        else {
            driveJoyCar(0, innerWheelSpeed, 0, pwmSpeed);
        }
      }
      else {
        // Backwards
        if(direction == LRDirection.Left){
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
      if(intensity == StopIntensity.Intense){
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
    export function servo(servo: number, angle: number){
      if(servo == 1){
        pins.servoWritePin(AnalogPin.P1, angle);
      }
      else {
        pins.servoWritePin(AnalogPin.P13, angle);
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
      if(direction == LRDirection.Left){
        biasL = scale(percent, 0, 100, 100, 0);
      }
      else if(direction == LRDirection.Right) {
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
    export function drivePwm(ch2: number, ch3: number, ch4: number, ch5: number){
      driveJoyCar(ch2, ch3, ch4, ch5);
    }

    /**
     * Turn on/off the front light
     */
    //% block="Toggle light%toggle"
    //% subcategory=LEDs
    //% weight=100
    export function light(toggle: ToggleSwitch) {
        if(toggle == ToggleSwitch.On){
            strip.setPixelColor(0, 0xB2B2B2);
            strip.setPixelColor(3, 0xB2B2B2);
            strip.setPixelColor(5, 0xB30000);
            strip.setPixelColor(6, 0xB30000);
        }
        else {
            strip.setPixelColor(0, 0x000000);
            strip.setPixelColor(3, 0x000000);
            strip.setPixelColor(5, 0x000000);
            strip.setPixelColor(6, 0x000000);
        }
        strip.show();
    }

    /**
     * Turn on/off the brake light
     */
    //% block="Toggle brakelight%toggle"
    //% subcategory=LEDs
    //% weight=90
    export function brakelight(toggle: ToggleSwitch) {
        if(toggle == ToggleSwitch.On){
            strip.setPixelColor(5, 0xff0000);
            strip.setPixelColor(6, 0xff0000);
        }
        else {
            strip.setPixelColor(5, 0x000000);
            strip.setPixelColor(6, 0x000000);
        }
        strip.show();
    }

    /**
     * Turn on/off left/right indicator
     */
    //% block="Turn %toggle %selection indicator"
    //% subcategory=LEDs
    //% weight=80
    export function indicator(toggle: ToggleSwitch, selection: SensorLRSelection) {
        if(toggle == ToggleSwitch.On){
            if(selection == SensorLRSelection.Left){
                if((input.runningTime() - lastIndicator >= 400) && !indicatorBool){
                    strip.setPixelColor(1, 0xff7200);
                    strip.setPixelColor(4, 0xff7200);
                    indicatorBool = true;
                    lastIndicator = input.runningTime();
                }
                else if((input.runningTime() - lastIndicator >= 400) && indicatorBool){
                    strip.setPixelColor(1, 0x00000);
                    strip.setPixelColor(4, 0x00000);
                    indicatorBool = false;
                    lastIndicator = input.runningTime();
                }
            }
            else if(selection == SensorLRSelection.Right){
                if((input.runningTime() - lastIndicator >= 400) && !indicatorBool){
                    strip.setPixelColor(2, 0xff7200);
                    strip.setPixelColor(7, 0xff7200)
                    indicatorBool = true;
                    lastIndicator = input.runningTime();
                }
                else if((input.runningTime() - lastIndicator >= 400) && indicatorBool){
                    strip.setPixelColor(2, 0x00000);
                    strip.setPixelColor(7, 0x00000);
                    indicatorBool = false;
                    lastIndicator = input.runningTime();
                }
            }
        }
        else {
            if(selection == SensorLRSelection.Left){
                strip.setPixelColor(1, 0x000000);
                strip.setPixelColor(4, 0x000000);
            }
            if(selection == SensorLRSelection.Right){
                strip.setPixelColor(2, 0x000000);
                strip.setPixelColor(7, 0x000000);
            }
        }
        strip.show();
    }

    /**
     * Turn on/off hazard lights
     */
    //% block="Turn %toggle hazard lights"
    //% subcategory=LEDs
    //% weight=70
    export function hazardlights(toggle: ToggleSwitch) {
        if(toggle == ToggleSwitch.On){
            if((input.runningTime() - lastHazard >= 400) && !hazardBool){
                strip.setPixelColor(1, 0xff7200);
                strip.setPixelColor(2, 0xff7200);
                strip.setPixelColor(4, 0xff7200);
                strip.setPixelColor(7, 0xff7200);
                hazardBool = true;
                lastHazard = input.runningTime();
            }
            else if((input.runningTime() - lastHazard >= 400) && hazardBool){
                strip.setPixelColor(1, 0x00000);
                strip.setPixelColor(2, 0x00000);
                strip.setPixelColor(4, 0x00000);
                strip.setPixelColor(7, 0x00000);
                hazardBool = false;
                lastHazard = input.runningTime();
            }
        }
        else {
            strip.setPixelColor(1, 0x00000);
            strip.setPixelColor(2, 0x00000);
            strip.setPixelColor(4, 0x00000);
            strip.setPixelColor(7, 0x00000);
        }
        strip.show();
    }

    /**
     * Turn on/off reverse light
     */
    //% block="Toggle reverse light%toggle"
    //% subcategory=LEDs
    //% weight=60
    export function reversinglight(toggle: ToggleSwitch) {
      if(toggle == ToggleSwitch.On){
        strip.setPixelColor(6, 0xffffff);
      }
      else {
        strip.setPixelColor(6, 0x000000);
      }
      strip.show();
    }



    /**
     * Check sonar
     */
    //% block="Check ultrasonic-sensor"
    //% subcategory=Sensors
    //% weight=100
    export function sonar() {
      let echo = DigitalPin.P12;
      let trigger = DigitalPin.P8;
      let duration = 0;
      pins.digitalWritePin(trigger, 0);
      control.waitMicros(2);
      pins.digitalWritePin(trigger, 1);
      control.waitMicros(10);
      pins.digitalWritePin(trigger, 0);
      duration = pins.pulseIn(echo, PulseValue.High);
      return (duration*((0.034/2)*(30/18)));
    }

    /**
     * Check left/center/right linefinder-sensor
     */
    //% block="Check %selection linefinder-sensor"
    //% subcategory=Sensors
    //% weight=90
    export function linefinder(selection: SensorLCRSelection) {
      if(selection == SensorLCRSelection.Left){
        return sensorData(2);
      }
      else if(selection == SensorLCRSelection.Center){
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
      if(selection == SensorLRSelection.Left){
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
      if(selection == SensorLRSelection.Left){
        return sensorData(0);
      }
      else {
        return sensorData(1);
      }
    }

    /**
     * Buzzer
     */
    //% block="start music %melody repeating %options"
    //% subcategory="Additional Functions"
    //% weight=100
    export function buzzer(melody: Melodies, options: MelodyOptions): void{
        pins.analogSetPitchPin(AnalogPin.P16);
        music.beginMelody(music.builtInMelody(melody), options);
    }

    /**
      * ADC Input Voltage
      */
    //% block="Read Input Voltage"
    //% subcategory="Additional Functions"
    //% weight=90
    export function readAdc(){
      let uref = 0.00322265625;
      let uratio = 2.7857142;

      let adcvoltage = pins.analogReadPin(AnalogPin.P2);
      return (uref * adcvoltage * uratio);
    }

    // ------------------------------------------------------------
    // Drive controller
    function driveJoyCar(ch2: number, ch3: number, ch4: number, ch5: number){
      // Map PWM numbers to working range of motors
      if(ch2 > 0){
        ch2 = ch2 * (biasR/100);
        ch2 = scale(ch2, 0, 255, 80, 255);
      }
      if(ch3 > 0){
        ch3 = ch3 * (biasR/100);
        ch3 = scale(ch3, 0, 255, 80, 255);
      }
      if(ch4 > 0){
        ch4 = ch4 * (biasL/100);
        ch4 = scale(ch4, 0, 255, 80, 255);
      }
      if(ch5 > 0){
        ch5 = ch5 * (biasL/100);
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
    function sensorData(bit: number){
      let expander = pins.i2cReadBuffer(56, 1, true);
      let bin = [];
      while(expander[0] > 0) {
        bin.push(expander[0] % 2);
        expander[0] >>= 1;
      }

      return !(!!bin[bit]);
    }

    // Mapping function
    function scale (num: number, in_min: number, in_max: number, out_min: number, out_max: number) {
      return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

}
