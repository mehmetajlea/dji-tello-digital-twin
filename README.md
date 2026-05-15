DJI Tello Digital Twin System
<img width="1909" height="942" alt="dashboard png" src="https://github.com/user-attachments/assets/2f74a10b-819b-49a7-a5a0-db60ea9dbe63" />
Overview

This project presents a real-time Digital Twin system for the DJI Tello UAV. The platform combines a Python FastAPI backend with a React and Three.js frontend to simulate drone motion, stream telemetry, and visualize UAV behavior in an interactive 3D environment. The system was developed as part of a robotics and intelligent systems project focused on Digital Twin architectures, real-time communication, UAV simulation, and web-based visualization technologies. The Digital Twin allows users to monitor drone states, simulate autonomous trajectories, visualize telemetry in real time, and interact with the UAV through a modern dashboard interface.

Technologies Used
FastAPI (Python)
React + TypeScript
Three.js / React Three Fiber
WebSockets
Vite
HTML/CSS
System Architecture

The project follows a client-server Digital Twin architecture. The backend is implemented using FastAPI and is responsible for drone simulation logic, flight state management, real-time telemetry generation, autonomous trajectory calculations, and WebSocket communication. The frontend is developed using React, TypeScript, and Three.js for real-time 3D visualization, telemetry display, dashboard rendering, and interactive controls. Communication between the frontend and backend is handled through WebSockets, enabling low-latency telemetry streaming and continuous synchronization between the simulation engine and the virtual drone model.

Features
Real-time 3D UAV simulation
Live telemetry dashboard
Interactive flight controls
WebSocket-based communication
Autonomous flight trajectories
Circular flight simulation
Figure-8 (Lemniscate) trajectory
Turbo mode simulation
Battery and altitude monitoring
Real-time coordinate visualization
Responsive dashboard interface
Real-Time Simulation

The backend executes an asynchronous simulation loop that continuously updates the drone’s position, velocity, altitude, rotation, route state, and battery level. These updates are streamed through WebSockets to the frontend, where the 3D model dynamically reflects the simulated drone behavior. The virtual UAV remains synchronized with the simulation engine in real time, creating a functional Digital Twin environment capable of demonstrating UAV movement, monitoring, and interaction.

Autonomous Trajectories

The system includes predefined autonomous flight patterns such as circular trajectories, figure-8 (lemniscate) paths, hover mode, and manual navigation mode. Trajectory calculations are performed in the backend and visualized instantly in the frontend through the 3D Digital Twin interface.

Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload

The backend server runs on:

http://localhost:8000
Frontend Setup
cd frontend

npm install

npm run dev

The frontend application runs on:

http://localhost:5173
Dashboard Capabilities

The dashboard provides real-time drone telemetry visualization, altitude monitoring, position tracking, battery indication, route visualization, and simulation controls. The 3D viewport is implemented using React Three Fiber and Three.js to create an interactive UAV visualization environment that reflects the live state of the simulation.

Future Improvements

Possible future extensions include real DJI Tello integration, sensor synchronization, AI-based autonomous navigation, collision detection, flight history logging, VR/XR integration, advanced trajectory planning, and real-world telemetry synchronization.

Educational Value

This project combines several important robotics and software engineering concepts, including Digital Twin systems, UAV simulation, real-time communication, web technologies, 3D visualization, human-machine interfaces, and distributed system architecture. The project demonstrates how theoretical Digital Twin concepts can be transformed into a practical and interactive engineering application.

Author

Lea Mehmetaj

License

This project is intended for educational and research purposes.
