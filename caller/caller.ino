#include "OLED.h"
#include "pulse_oximeter.h"

int resting_HR{-1};
int minHR{90};
int maxHR{140};

void setup() {
    Serial.begin(115200);
    OLED_init();
    Max30102_init();
    OLED_center("rest HR is...");
    resting_HR = restingHR();
    OLED_center_int(resting_HR);

    // send resting HR once
    Serial.print("{\"type\":\"rest\",\"hr\":");
    Serial.print(resting_HR);
    Serial.println("}");
}

void loop() {
    int chr = Max30102_readHR();
    OLED_display_HR(minHR, maxHR, chr, chr - resting_HR);

    if (chr != -1) {   // only send valid readings
        Serial.print("{\"type\":\"live\",\"hr\":");
        Serial.print(chr);
        Serial.print(",\"reps\":0}");   // no rep counter yet (BMX160 is commented out)
        Serial.println();
    }
    delay(1000);
}
