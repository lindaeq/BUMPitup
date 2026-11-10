# BUMPitup

BUMPitup empowers expectant mothers and supports healthcare providers with personalized pregnancy exercise plans, symptom tracking, AI-powered guidance, and rehabilitation progress monitoring.

BUMPitup bridges the gap in maternal healthcare by transforming general prenatal exercise recommendations into actionable, trackable, and safe physical therapy. The platform provides a centralized, mobile-first experience for patients to safely execute routines while giving healthcare providers real-time data and AI-assisted summaries to monitor rehabilitation journeys. 

The project was awarded Overall 1st Place at the WiE Hackathon 2026.

## Feature Overview

| Patient Experience | Healthcare Provider Experience |
| :--- | :--- |
| Access routines with prescribed repetitions, sets, step-by-step instructions, and safety tips | Assign exercises on a case-by-case basis or implement scheduled exercises for patients |
| Track completed exercises, repetitions, range of motion, and activity over time using interactive calendars | Generate charts with statistics from heart rate to completion accuracy to evaluate success and modify future tasks |
| Record pain levels, discomfort locations, fatigue, and other symptoms to monitor changes throughout pregnancy | Review check-ins, recent exercise sessions, and raw data trends |
| Use built-in rule-based checks that flag concerning symptoms and high pain reports, directing users to seek medical attention before continuing | Receive immediate flags regarding high-risk patient entries |
| Ask an integrated AI assistant questions about prenatal wellness, mobility, and general pregnancy education | Request on-demand AI summaries of patient success, pain, and symptoms after exercise sessions |
| View custom fruit illustrations and interactive pregnancy-week information to understand fetal development | View patient baseline pregnancy metrics and active gestation week |
| Utilize camera-based movement tracking and wearable wristband tracking interfaces | Monitor hardware metrics transmitted via the client interface |

## How It Works

BUMPitup is built as an interactive, mobile-first web application using React 19, TypeScript, and Vite, with Tailwind CSS for styling. 

* Built using React 19 and TypeScript. The interface is organized into individual screens and reusable components across the dashboard, daily check-ins, exercise plans, progress tracking, pregnancy calendar, and educational assistant.
* Built with custom Recharts-based views and interactive calendars to visualize exercise history, pain levels, activity, and rehabilitation trends.
* Developed as a Node.js backend that connects the application to the OpenAI API using the GPT-4o mini model. 
* Features a pregnancy-specific system prompt with clear medical safety boundaries to provide concise, accessible educational responses without issuing diagnoses.
* Features a prototype that includes camera-based and wearable exercise-tracking interfaces. These use simulated movement and sensor data, with the architecture built to support future MediaPipe pose estimation and Pulse Oximeter MAX30102 hardware integration.

## Get Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

```sh
cd apps/web
npm install
cp .env.example .env.local
```

### Environment Configuration

For AI features, create `apps/web/.env` and add your credential key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Ensure all API keys are kept out of Vite environment variables and version control.

### Run the Application

```sh
npm run dev
```

Open the Vite URL for the patient view. Add `?view=physio` to the URL for the physiotherapist view. Open both at once to see simulated updates mirror across views.

### Verification Suite

Run the following commands from `apps/web` to check the project:

```sh
npm run test
npm run lint
npm run build
```

## Next Steps

* Reduce clinical workload by having AI analyze patient data and automatically suggest potential exercises to improve mobility and health.
* Integrate a secure database to persistently store patient check-ins, exercise history, and progress over time.
* Introduce voice-to-text symptom reporting and other streamlined input methods to make daily reporting easier and reduce manual data entry.

