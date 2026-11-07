//#include "BMX160.h"
//#include "OLED.h"
#include "pulse_oximeter.h"

void setup() {
    // Initialization code here
    Serial.begin(115200);
   // OLED_init();
 //   BMX160_init();
    Max30102_init();
    Serial.println("Started!");
}
void loop() {
    // Main code here
  //  BMX160_read();
   // OLED_display_rep(15);
    Serial.print(Max30102_readHR());
    delay(50);  // Read approximately 20 times per second
    Serial.print("loop");
}