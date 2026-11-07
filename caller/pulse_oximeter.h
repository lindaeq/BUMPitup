#ifndef PULSEOXIMETER_H
#define PULSEOXIMETER_H

#include <Arduino.h>

void Max30102_init();
void Max30102_readIR();
int Max30102_readHR();
int restingHR();

#endif