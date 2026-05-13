from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DroneState:
    def __init__(self):
        self.position = {"x": 0.0, "y": 0.0, "z": 0.0}
        self.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
        self.is_playing = False
        self.speed = 50
        self.altitude = 0.0
        self.target_altitude = 8.0
        self.rotation = 0.0
        self.spin_remaining = 0.0
        self.time_tick = 0
        self.battery = 100
        self.turbo = False
        self.route = "hover"
        self.logs = ["System ready. Type 'help'."]

    def get_state(self):
        return {
            "position": self.position,
            "rotation": self.rotation,
            "speed": self.speed,
            "altitude": self.altitude,
            "battery": self.battery,
            "is_playing": self.is_playing,
            "turbo": self.turbo,
            "route": self.route,
            "spinning": self.spin_remaining > 0,
            "logs": self.logs[-6:]
        }

drone = DroneState()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                cmd = json.loads(data)
                
                if cmd.get("action") == "toggle_play":
                    drone.is_playing = not drone.is_playing
                    if drone.is_playing:
                        drone.route = "hover"
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                    drone.logs.append(f"Simulation {'Started' if drone.is_playing else 'Stopped'}")
                elif cmd.get("action") == "set_speed":
                    drone.speed = cmd["value"]
                elif cmd.get("action") == "set_altitude":
                    drone.altitude = cmd["value"]
                  
                    if drone.route in ["takeoff", "landing"]:
                        drone.route = "hover"
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                elif cmd.get("action") == "set_rotation":
                    drone.rotation = cmd["value"]
                    drone.spin_remaining = 0  
                    
                elif cmd.get("action") == "start_move":
                    drone.route = "manual"
                    drone.is_playing = True
                    base_speed = 3.0
                    direction = cmd.get("value")
                    if direction == "up": drone.velocities["y"] = base_speed
                    elif direction == "down": drone.velocities["y"] = -base_speed
                    elif direction == "left": drone.velocities["x"] = -base_speed
                    elif direction == "right": drone.velocities["x"] = base_speed
                    elif direction == "forward": drone.velocities["z"] = base_speed
                    elif direction == "back": drone.velocities["z"] = -base_speed
                    
                elif cmd.get("action") == "stop_move":
                    direction = cmd.get("value")
                    if direction in ["up", "down"]: drone.velocities["y"] = 0.0
                    elif direction in ["left", "right"]: drone.velocities["x"] = 0.0
                    elif direction in ["forward", "back"]: drone.velocities["z"] = 0.0
                
                elif cmd.get("action") == "console_cmd":
                    command = cmd['command'].lower().strip()
                    drone.logs.append(f"> {command}")
                    
                    if command == "takeoff":
                        drone.is_playing = True
                        drone.target_altitude = 8.0
                        drone.route = "takeoff"
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.spin_remaining = 0
                        drone.logs.append("Taking off to 8m...")
                    elif command == "land":
                        drone.route = "landing"
                        drone.spin_remaining = 0
                        drone.logs.append("Landing sequence initiated...")
                    elif command == "spin":
                        drone.is_playing = True
                        drone.spin_remaining = 360.0
                        drone.logs.append("Spinning 360 degrees!")
                    elif command == "battery":
                        drone.battery = 100
                        drone.logs.append("Battery recharged to 100%")
                    elif command == "reset":
                        drone.position = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.altitude = 0
                        drone.target_altitude = 8.0
                        drone.rotation = 0
                        drone.spin_remaining = 0
                        drone.time_tick = 0
                        drone.battery = 100
                        drone.is_playing = False
                        drone.turbo = False
                        drone.route = "hover"
                        drone.logs.append("System reset to Home.")
                    elif command == "turbo":
                        drone.turbo = True
                        drone.logs.append("TURBO MODE ON! Speed x2.5")
                    elif command == "normal":
                        drone.turbo = False
                        drone.logs.append("NORMAL mode. Speed x1.0")
                    elif command in ["hover", "stop"]:
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.route = "hover"
                        drone.logs.append("Hovering in place.")
                    elif command == "circular":
                        drone.route = "circular"
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.is_playing = True
                        drone.spin_remaining = 0
                        drone.logs.append("Route: Circular (Auto)")
                    elif command == "figure8":
                        drone.route = "figure8"
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.is_playing = True
                        drone.spin_remaining = 0
                        drone.logs.append("Route: Figure-8 (Auto)")
                    elif command == "help":
                        drone.logs.append("Auto Routes: circular, figure8")
                        drone.logs.append("Manual Cmds: up, down, left, right, forward, back, hover, stop")
                        drone.logs.append("Actions: takeoff, land, spin, turbo, normal, battery, reset")
                    else:
                        drone.logs.append("Unknown command. Type 'help'.")
            except asyncio.TimeoutError:
                pass

            if drone.is_playing:
                dt = 0.033
                turbo_mult = 2.5 if drone.turbo else 1.0
                
                
                if drone.spin_remaining > 0:
                    spin_speed = 12.0 * turbo_mult
                    spin_step = min(spin_speed, drone.spin_remaining)
                    drone.rotation = (drone.rotation + spin_step) % 360
                    drone.spin_remaining = max(0, drone.spin_remaining - spin_step)
                
                
                if drone.route == "takeoff":
                    drone.altitude = min(drone.target_altitude, drone.altitude + 3.0 * dt)
                    drone.position["y"] = drone.altitude
                    if drone.altitude >= drone.target_altitude:
                        drone.route = "hover"
                        drone.logs.append("Target altitude reached. Hovering.")
                    

                elif drone.route == "landing":
                    descent_rate = 3.0 if drone.altitude > 2.0 else 1.5
                    drone.altitude = max(0, drone.altitude - descent_rate * dt)
                    drone.position["y"] = drone.altitude
                    # Ngadalo horizontalisht gjate uljes
                    for key in ["x", "z"]:
                        drone.velocities[key] *= 0.95
                        drone.position[key] += drone.velocities[key] * dt
                    if drone.altitude <= 0.01:
                        drone.altitude = 0
                        drone.position["y"] = 0
                        drone.velocities = {"x": 0.0, "y": 0.0, "z": 0.0}
                        drone.is_playing = False
                        drone.route = "hover"
                        drone.turbo = False
                        drone.logs.append("Landed successfully.")
                    
             
                elif drone.route == "manual":
                    drone.position["x"] += drone.velocities["x"] * dt * turbo_mult
                    drone.position["y"] += drone.velocities["y"] * dt * turbo_mult
                    drone.position["z"] += drone.velocities["z"] * dt * turbo_mult
                    drone.position["y"] = max(0, min(10, drone.position["y"]))
                    drone.altitude = drone.position["y"]
                    
                
                elif drone.route == "hover":
                    drone.position["y"] = drone.altitude
                    
              
                else:
                    drone.time_tick += (drone.speed / 25) * turbo_mult * 0.04
                    if drone.route == "circular":
                        x = math.cos(drone.time_tick) * 5
                        z = math.sin(drone.time_tick) * 5
                    elif drone.route == "figure8":
                        x = math.sin(drone.time_tick) * 5
                        z = math.sin(drone.time_tick) * math.cos(drone.time_tick) * 5
                    else:
                        x = 0
                        z = 0
                    drone.position = {"x": x, "y": drone.altitude, "z": z}
                
               
                drone.battery = max(0, drone.battery - 0.005 * turbo_mult)

            await websocket.send_json(drone.get_state())
            await asyncio.sleep(0.033)
            
    except WebSocketDisconnect:
        print("Disconnected")