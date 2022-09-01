# MakeCode Package for Joy-IT Joy-Car

This library provides a Microsoft Makecode package for the Joy-IT Joy-Car.
See https://joy-it.net/en/products/mb-joy-car for more details.

## Smart collision detection

The smart collision detection is only available if you have mounted the ultrasonic sensor in the top position, in combination with the servo motor. In this case, the ultrasonic sensor checks for obstacles in all front directions and returns if an obstacle is close or not.

|    Return value     |      Direction     |
| ------------------- |:------------------:|
|          0          |       nothing      |
|          1          |       left         |
|          2          |       middle       |     
|          3          |       right        |

```typescript
// Start collision detection
if (JoyCar.collisionDetection() == 1) {
    // do something
    }
```

## Driving
You can drive the Joy-Car forwards or backwards by using the `drive(...)` block. Within this block you specify the direction aswell as the speed in percent from 0 to 100.
Both motors will be driven in the selected direction with the selected speed.
```typescript
// Move the Joy-Car forwards at 100% speed
JoyCar.drive(FRDirection.Forward, 100)

// Move the Joy-Car backwards at 40% speed
JoyCar.drive(FRDirection.Reverse, 40)
```

## Turning
You can use the `turn(...)` block to drive forwards or backwards in combination with turning left or right.
You can specify the orientation (forward, reverse), direction (left, right) aswell as the speed (0 - 100%) and the size of the curve-radius (0-5).
The larger the curve-radius the wider the turn will be (0 = very sharp turn, 5 = very wide turn).
```typescript
// Turn forwards and left with 100% speed and a very sharp curve
JoyCar.turn(FRDirection.Forward, LRDirection.Left, 100, 0)

// Turn right and reverse with 50% speed and a wide curve
JoyCar.turn(FRDirection.Reverse, LRDirection.Right, 50, 5)
```

## Stopping
Use `stop(...)` to either brake with an intense stop or with declining speed.
```typescript
// Intense Stop
JoyCar.stop(StopIntensity.Intense)

// Soft Stop
JoyCar.stop(StopIntensity.Soft)
```

## Servo Control
You can set the angle (0 - 180) of the two optional servos which are connected to pin P1 and P13 of the micro:bit by using `servo(...)`.
```typescript
// Set Servo 1 to 90
JoyCar.servo(1, 90)

// Set Servo 2 to 45
JoyCar.servo(2, 45)
```

## Bias
Both motors will probably, due to manufacturing tolerances, not spin at the very same speed. This can result in driving small curves when you intend to drive straight forward or backward. In this case you can set a global bias with `bias(...)` which will slow down the speed-signal for the specific motor. This shall compensate any speed differences.
```typescript
// Reduce Left Motor Speed permanently by 5%
JoyCar.bias(LRDirection.Left, 5)

// Reduce Right Motor Speed permanently by 2%
JoyCar.bias(LRDirection.Right, 2)
```

## PWM-Signals
You can also send direct PWM-Signals to all four channels (Channel 2, Channel 3, Channel 4 & Channel 5) of the motor-controller by using `drivePwm(...)`.
```typescript
  // Set PWM signal 255 to Channel 2
  JoyCar.drivePwm(255, 0, 0, 0)

  // Set PWM signal 100 to Channel 3
  JoyCar.drivePwm(0, 100, 0, 0)

  // Set PWM signal 255 to Channel 4 and 5
  Joycar.drivePwm(0, 0, 255, 255)
```

## Headlights
Turn on/off the headlights (white light from the two front LED modules) by using `light(...)`.
```typescript
// Turn on the headlights
JoyCar.light(ToggleSwitch.On)

// Turn off the headlights
JoyCar.light(ToggleSwitch.Off)
```

## Brakelights
Turn on/off the brakelight (red light from the two rear LED modules) by using `brake(...)`.
```typescript
// Turn on the brakelights
JoyCar.brakelight(ToggleSwitch.On)

// Turn off the brakelights
JoyCar.brakelight(ToggleSwitch.Off)
```

## Indicators
Turn on/off the indicators (flashing orange light from the front and rear LED module on the left or right side) for a specific side with `indicator(...)`.
```typescript
// Turn on the left indicators
JoyCar.indicator(ToggleSwitch.On, SensorLRSelection.Left)

// Turn off the right indicators
JoyCar.indicator(ToggleSwitch.Off, SensorLRSelection.Right)
```
## Hazard Lights
Turn on/off the hazard lights (flashing orange light from all LED modules) with `hazardlights(...)`.
```typescript
// Turn hazard lights on
JoyCar.hazardlights(ToggleSwitch.On)

// Turn hazard lights off
JoyCar.hazardlights(ToggleSwitch.Off)
```

## Reverse Lights
Turn on/off the reverse lights (white light from the rear LED modules) with `reversinglight(...)`.
```typescript
// Turn on reverse lights
JoyCar.reversinglight(ToggleSwitch.On)

// Turn off reverse lights
JoyCar.reversinglight(ToggleSwitch.Off)
```

## Ultrasonic Sensor
Check the ultrasonic sensor with `sonar()`. The return value is the distance to the closest object measured from the sensor. The sensor is connected to the pins P12 (echo) and P8 (trigger) of the micro:bit.
```typescript
// Measure distance
JoyCar.sonar()
```

## Linefinder Sensor
Check the linefinder sensors with `linefinder(...)`. The function returns true if a line was detected. The sensors are connected to channel 3, 4 & 5 of the IO-Expander.
```typescript
// Check the left Linefinder Sensor
JoyCar.linefinder(SensorLCRSelection.Left)

// Check the center Linefinder Sensor
JoyCar.linefinder(SensorLCRSelection.Center)

// Check the right Linefinder Sensor
JoyCar.linefinder(SensorLCRSelection.Right)
```

## Obstacle Sensor
Check the obstacle sensors with `obstacleavoidance(...)`. The function returns true if an obstacle was detected. The sensors are connected to channel 1 & 2 of the IO-Expander.
```typescript
// Check left obstacle sensor
JoyCar.obstacleavoidance(SensorLRSelection.Left)

// Check right obstacle sensor
JoyCar.obstacleavoidance(SensorLRSelection.Right)
```

## Speed Sensor
Check the speed sensors with `speed(...)`. The function returns true if the light is interrupted by the perforated disc on the motor.
```typescript
// Check left speed sensor
JoyCar.speed(SensorLRSelection.Left)

// Check right speed sensor
JoyCar.speed(SensorLRSelection.Right)
```

## Buzzer
Play predefined melodies with the buzzer with `buzzer()`. You can also specifiy repeat options.
```typescript
// Play the Dadadadum Sound once
JoyCar.buzzer(Melodies.Dadadadum, MelodyOptions.Once)

// Play the Nyan Sound on repeat
JoyCar.buzzer(Melodies.Nyan, MelodyOptions.Forever)
```

## Read Battery Voltage
Read the current battery voltage from the ADC on the AnalogPin2 by using `readAdc()`.
```typescript
// Print battery voltage to console
serial.writeString(JoyCar.readAdc());
```

## Supported targets

* for PXT/microbit

## License

MIT
