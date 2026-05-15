# DJI Tello Digital Twin System


<img width="1909" height="942" alt="dashboard png" src="https://github.com/user-attachments/assets/2f74a10b-819b-49a7-a5a0-db60ea9dbe63" />

## Overview

This project presents a real-time Digital Twin system for the DJI Tello UAV.  
The platform combines a Python FastAPI backend with a React and Three.js frontend to simulate drone motion, stream telemetry, and visualize UAV behavior in an interactive 3D environment.

The system was developed as part of a robotics and intelligent systems project focused on Digital Twin architectures, real-time communication, UAV simulation, and web-based visualization technologies.

The Digital Twin allows users to monitor drone states, simulate autonomous trajectories, visualize telemetry in real time, and interact with the UAV through a modern dashboard interface.

***

## Technologies Used

- FastAPI (Python)
- React + TypeScript
- Three.js / React Three Fiber
- WebSockets
- Vite
- HTML/CSS

-

## System Architecture

The project follows a client-server Digital Twin architecture.

### Backend

The backend is implemented using FastAPI and is responsible for:
- Drone simulation logic
- Flight state management
- Real-time telemetry generation
- Autonomous trajectory calculations
- WebSocket communication

### Frontend

The frontend is developed using React, TypeScript, and Three.js for:
- Real-time 3D visualization
- Telemetry display
- Interactive dashboard rendering
- Flight controls and monitoring
- Dynamic drone animation

### Communication

The frontend and backend communicate using WebSockets, enabling:
- Low-latency telemetry streaming
- Continuous synchronization
- Real-time Digital Twin behavior

---

## Features

- Real-time 3D UAV simulation
- Live telemetry dashboard
- Interactive flight controls
- WebSocket-based communication
- Autonomous flight trajectories
- Circular flight simulation
- Figure-8 (Lemniscate) trajectory
- Turbo mode simulation
- Battery and altitude monitoring
- Real-time coordinate visualization
- Responsive dashboard interface

---

## Real-Time Simulation

The backend executes an asynchronous simulation loop that continuously updates:
- Position (X, Y, Z)
- Velocity
- Altitude
- Rotation (Yaw)
- Route state
- Battery level

These updates are streamed through WebSockets to the frontend, where the 3D model dynamically reflects the simulated drone behavior.

The virtual UAV remains synchronized with the simulation engine in real time, creating a functional Digital Twin environment.

---

## Autonomous Trajectories

The system includes predefined autonomous flight patterns:
- Circular trajectory
- Figure-8 trajectory
- Hover mode
- Manual navigation mode

Trajectory calculations are performed in the backend and visualized instantly in the frontend through the Digital Twin interface.

---

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

The backend server runs on:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend application runs on:

```text
http://localhost:5173
```

---

## Dashboard Capabilities

The dashboard provides:
- Drone telemetry visualization
- Altitude monitoring
- Position tracking
- Battery indication
- Route visualization
- Simulation controls
- Real-time flight status

The 3D viewport is implemented using React Three Fiber and Three.js to create an interactive UAV visualization environment.

---

## Future Improvements

Possible future extensions include:
- Real DJI Tello integration
- Sensor synchronization
- AI-based autonomous navigation
- Collision detection
- Flight history logging
- VR/XR integration
- Advanced trajectory planning
- Real-world telemetry synchronization

---

## Educational Value

This project combines several important robotics and software engineering concepts:
- Digital Twin systems
- UAV simulation
- Real-time communication
- Web technologies
- 3D visualization
- Human-machine interfaces
- Distributed system architecture

The project demonstrates how theoretical Digital Twin concepts can be transformed into a practical and interactive engineering application.

---

## Author

Lea Mehmetaj

---

## License

This project is intended for educational and research purposes.
