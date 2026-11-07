#include "OLED.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <cstring>
// Screen Variables
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define OLED_RESET -1
// int SDA_PIN=0;
// int SCL_PIN=1;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
// coord find_coord(int len, int y_offset=0, int x_offset=0); //Finds the coordinates to center text on the screen
// int int_len(int n);
// void OLED_init(); //Call in setup() to initialize the OLED display
// void OLED_display_rep(int rep); //Call each time rep changes
// void OLED_display_HR(int minHR, int maxHR, int actualHR); //Call to show the HR range and actual HR
// void OLED_warning(const char* problem); //Call to display a warning message


coord find_coord(int len, int y_offset, int x_offset) {
    int x = (SCREEN_WIDTH - len*6) / 2 + x_offset;
    int y = (SCREEN_HEIGHT - 8) / 2 + y_offset;
    return coord(x, y);
}

int int_len(int n){
  int len=1;
  while (n > 9){
    len+=1;
    n=n/10;
  }
  return len;
}

void OLED_init() {
    Wire.begin();
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
}

void OLED_display_rep(int rep) {
// Must clear the display before putting anything on it
    coord rep_coord = find_coord(7 + int_len(rep), 0, -20);
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(rep_coord.getX(), rep_coord.getY());
    display.print("Reps: ");
    display.print(rep);
//    Serial.println(adcValue); // Print the value to Serial Monitor
    display.display();
}
void OLED_display_HR(int minHR, int maxHR, int actualHR) {
    if (minHR>999 || maxHR>999 || actualHR>999) {
        OLED_warning("HR too high");
        return;
    }
    coord hr_coord = find_coord(13+int_len(actualHR), -20);
    coord range_coord = find_coord(12+int_len(minHR)+int_len(maxHR), 20);
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(hr_coord.getX(), hr_coord.getY());
    display.print("Your HR: ");
    display.print(actualHR);
    display.print(" BPM");

    display.setCursor(range_coord.getX(), range_coord.getY());
    display.print("Range: ");
    display.print(minHR);
    display.print("-");
    display.print(maxHR);
    display.print(" BPM");

    display.display();
}
void OLED_warning(const char* problem) {
    coord warn_coord = find_coord(7, -20);
    coord prob_coord = find_coord(strlen(problem), 20);
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(1);

    display.setCursor(warn_coord.getX(), warn_coord.getY());
    display.println("WARNING");
    display.setCursor(prob_coord.getX(), prob_coord.getY());
    display.println(problem);
    display.display();
}