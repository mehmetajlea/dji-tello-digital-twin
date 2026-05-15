
<img width="1909" height="942" alt="dashboard png" src="https://github.com/user-attachments/assets/2f74a10b-819b-49a7-a5a0-db60ea9dbe63" />

Digital Twin for DJI Tello Drone 
This project implements a real time Digital Twin for the DJI Tello drone. It features a modern web architecture using Python (FastAPI) for the backend logic and React (Three.js) for the 3D visualization. The system allows users to simulate flight movements, monitor telemetry, and test autonomous trajectories in a safe virtual environment.

Backend: FastAPI (Python) - Handles simulation logic and WebSocket management.

Frontend: React, TypeScript, Three.js (React Three Fiber) - 3D rendering and dashboard UI.

Communication: WebSockets for real-time, full-duplex data streaming with minimal latency.

Real-Time 3D Simulation: The virtual drone model reflects movements based on physics calculations from the backend.

Autonomous Trajectories: Built-in algorithms for "Circular" and "Figure-8" (Lemniscate) flight paths.

Live Telemetry Dashboard: Monitor battery levels, altitude, 3D coordinates (X, Y, Z), and orientation (Yaw).

Interactive Control: Manual flight controls and simulation state management (Takeoff, Land, Turbo Mode).

1. Backend Setup (Python)
Bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload


2. Frontend Setup (React)
Bash
cd frontend
npm install
npm run dev

 How It Works
The backend runs an asynchronous simulation loop that updates the drone's state every 16ms (matching 60 FPS). This state is broadcasted via WebSockets to the React frontend. The 3D viewport uses these updates to transform the model's position and rotation instantly, ensuring the virtual twin is always synchronized with the simulation engine.

 Author
Lea Mehmetaj

