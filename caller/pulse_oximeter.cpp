#include "pulse_oximeter.h"  
#include <DFRobot_MAX30102.h>
#include <Wire.h>
#include <algorithm>

DFRobot_MAX30102 particleSensor;

int32_t SPO2;
int32_t heartRate;
int8_t validSPO2;
int8_t validHeartRate;

int HR_c = 0; // Calibration offset, if needed

void Max30102_init() {
    while (!particleSensor.begin()) {
        delay(1000);
    }

    particleSensor.sensorConfiguration(
        50,                 // LED brightness
        SAMPLEAVG_4,        // Sample averaging
        MODE_MULTILED,      // Red + IR
        SAMPLERATE_100,     // Sample rate
        PULSEWIDTH_411,     // Pulse width
        ADCRANGE_16384      // ADC range
    );
}

void Max30102_readIR() {
    uint32_t IRvalue = particleSensor.getIR();
    Serial.println(IRvalue);
}

int Max30102_readHR() {
    particleSensor.heartrateAndOxygenSaturation(
        &SPO2,
        &validSPO2,
        &heartRate,
        &validHeartRate
    );

    if (validHeartRate == 0) {
        return -1; // Invalid reading
    }

    return heartRate + HR_c;
}

int restingHR() {
    int arr[10];
    int count = 0;

    // Collect 10 valid readings
    while (count < 10) {
        int reading = Max30102_readHR();

        if (reading != -1) {
            arr[count] = reading;
            count++;
        }

        delay(1000);
    }

    std::sort(arr, arr + 10);

    // Median of 10 values = average of the two middle values
    return (arr[4] + arr[5]) / 2;
}