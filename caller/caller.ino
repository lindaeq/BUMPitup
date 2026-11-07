//#include "BMX160.h"
#include "OLED.h"
#include "pulse_oximeter.h"

int resting_HR{-1};
int minHR{90};
int maxHR{140};
void setup() {
    // Initialization code here
    Serial.begin(115200);
    OLED_init();
 //   BMX160_init();
    Max30102_init();
    Serial.println("Started!");
    OLED_center("rest HR is...");
    resting_HR= restingHR();
    OLED_center_int(resting_HR);

}
void loop() {
    // Main code here
  //  BMX160_read();
    int chr= Max30102_readHR();
    OLED_display_HR(minHR,maxHR,chr,chr-resting_HR);
    delay(1000);  
    Serial.print("loop");
}