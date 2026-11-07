//#include "BMX160.h"
#include "OLED.h"
#include "pulse_oximeter.h"

void setup() {
    // Initialization code here
    Serial.begin(115200);
    OLED_init();
 //   BMX160_init();
    Max30102_init();
    Serial.println("Started!");
}
void loop() {
    // Main code here
  //  BMX160_read();
    OLED_display_HR(150,200,Max30102_readHR());
    delay(1000);  
    Serial.print("loop");
}