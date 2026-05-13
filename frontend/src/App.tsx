import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, useGLTF, Environment, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Send } from 'lucide-react';
import './App.css';

const DroneModel = React.memo(function DroneModel({ droneDataRef }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/drone.glb');
  const propellersRef = useRef<THREE.Object3D[]>([]);
  const glowRef = useRef<THREE.PointLight>(null);
  const turboRef = useRef(false);
  const spinningRef = useRef(false);
  const [trailColor, setTrailColor] = useState("#ff00ff");
  const [isTurbo, setIsTurbo] = useState(false);

  useEffect(() => {
    propellersRef.current = [];
    scene.traverse((child) => {
      const name = child.name.toLowerCase();
      
      if ((child as THREE.Mesh).isMesh) {
        const mat = new THREE.MeshStandardMaterial({ 
          color: name.includes('pervane') ? '#ff00ff' : '#1a0a10',
          metalness: 0.9, roughness: 0.2, side: THREE.DoubleSide,
          transparent: true, opacity: name.includes('pervane') ? 1.0 : 0.3
        });
        (child as THREE.Mesh).material = mat;

        const edges = new THREE.EdgesGeometry((child as THREE.Mesh).geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ff00ff', linewidth: 2 }));
        child.add(line);
      }

      if (name.includes('pervane')) {
        propellersRef.current.push(child);
      }
    });
  }, [scene]);

  useFrame(() => {
    const droneState = droneDataRef.current;
    if (!groupRef.current || !droneState) return;

    const targetPos = new THREE.Vector3(droneState.position.x, droneState.position.y, droneState.position.z);
    groupRef.current.position.lerp(targetPos, 0.15);

    const targetRotation = THREE.MathUtils.degToRad(droneState.rotation || 0);
    groupRef.current.rotation.y = targetRotation;

    // Turbo & spinning refs (pa re-render)
    const newTurbo = !!droneState.turbo;
    const newSpinning = !!droneState.spinning;
    turboRef.current = newTurbo;
    spinningRef.current = newSpinning;
    if (newTurbo !== isTurbo) setIsTurbo(newTurbo);

    const newColor = droneState.battery < 20 ? "#ff0000" : (newTurbo ? "#ff6600" : "#ff00ff");
    if (newColor !== trailColor) setTrailColor(newColor);

    // Glow effect per turbo
    if (glowRef.current) {
      glowRef.current.intensity = newTurbo ? 4.0 : 0;
    }

    // Helikat - shpejtesia ndryshon sipas turbo dhe spin
    if (droneState.is_playing && propellersRef.current.length > 0) {
      let spinSpeed = 2.0;
      if (newTurbo) spinSpeed = 4.5;
      if (newSpinning) spinSpeed = 8.0;
      propellersRef.current.forEach(prop => { prop.rotation.y += spinSpeed; });
    }
  });

  return (
    <Trail width={isTurbo ? 3.5 : 2} length={6} color={trailColor} attenuation={(t) => Math.pow(t, 1.5)}>
      <group ref={groupRef}>
        <primitive object={scene} scale={1.0} />
        <pointLight ref={glowRef} color="#ff6600" intensity={0} distance={8} decay={2} />
      </group>
    </Trail>
  );
});

function useDroneData() {
  const droneDataRef = useRef<any>(null);
  const [uiState, setUiState] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        ws.current = new WebSocket('ws://localhost:8000/ws');
        ws.current.onopen = () => setIsConnected(true);
        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          droneDataRef.current = data;
          setUiState(data);
        };
        ws.current.onclose = () => { setIsConnected(false); setTimeout(connect, 3000); };
        ws.current.onerror = () => setIsConnected(false);
      } catch (error) { setIsConnected(false); }
    };
    connect();
    return () => { ws.current?.close(); };
  }, []);

  const sendCommand = (action: string, value?: any, command?: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, value, command }));
    }
  };

  return { droneDataRef, uiState, sendCommand, isConnected };
}

export default function App() {
  const { droneDataRef, uiState, sendCommand, isConnected } = useDroneData();
  const [consoleInput, setConsoleInput] = useState('');

  const handleSubmit = (e: any) => { e.preventDefault(); if (consoleInput.trim()) { sendCommand('console_cmd', undefined, consoleInput.trim()); setConsoleInput(''); }};

  const btnActionStyle = (active: boolean = false): React.CSSProperties => ({
    flex: 1,
    padding: '8px 4px',
    fontSize: '10px',
    fontFamily: 'Orbitron, monospace',
    letterSpacing: '1px',
    border: `1px solid ${active ? '#ff6600' : '#ff00ff'}`,
    background: active ? 'rgba(255, 102, 0, 0.15)' : 'rgba(255, 0, 255, 0.05)',
    color: active ? '#ff6600' : '#ff00ff',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.2s',
    textShadow: active ? '0 0 8px #ff6600' : 'none',
  });

  return (
    <div className="app-container">
      {!isConnected && (
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'red', padding: '10px 20px', borderRadius: 3, zIndex: 100, fontFamily: 'Orbitron', letterSpacing: 2, fontSize: 12 }}>
          ⚠ BACKEND OFFLINE
        </div>
      )}

      <div className="left-panel">
        <div className="panel-header">
          <h1>VELOCITY VIXENS</h1>
          <span>TELLO TWIN SYSTEM</span>
        </div>
        <div className="telem-card">
          <div className="telem-title">System Status</div>
          <div className="telem-value" style={{ color: isConnected ? '#00ffff' : '#ff0000' }}>
            {isConnected ? (uiState?.is_playing ? 'ACTIVE' : 'STANDBY') : 'OFFLINE'}
          </div>
          <div className="telem-sub">Route: {uiState?.route?.toUpperCase() || 'N/A'}</div>
        </div>
        <div className="telem-card">
          <div className="telem-title">Position (XYZ)</div>
          <div className="telem-value">
            X: {uiState?.position?.x.toFixed(2) || '0.00'}<br/>
            Y: {uiState?.position?.y.toFixed(2) || '0.00'}<br/>
            Z: {uiState?.position?.z.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="telem-card">
          <div className="telem-title">Rotation / Speed</div>
          <div className="telem-value">{uiState?.rotation?.toFixed(0) || 0}°</div>
          <div className="telem-sub">Speed: {uiState?.speed || 0}% {uiState?.turbo ? '⚡ TURBO' : ''}</div>
        </div>
        <div className="telem-card">
          <div className="telem-title">Battery Level</div>
          <div className="telem-value" style={{ color: uiState?.battery < 20 ? '#ff0000' : '#ff00ff' }}>
            {uiState?.battery?.toFixed(0) || 0}%
          </div>
        </div>
      </div>

      <div className="center-viewport">
        <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <spotLight position={[10, 15, 10]} angle={0.3} color="#ff00ff" intensity={2} castShadow />
          <pointLight position={[-10, -5, -10]} color="#00ffff" intensity={1} />
          <Environment preset="city" background={false} />
          <Suspense fallback={null}>
            <DroneModel droneDataRef={droneDataRef} />
          </Suspense>
          <axesHelper args={[3]} />
          <Grid infiniteGrid cellColor="#1a0a10" sectionColor="#ff00ff" fadeDistance={30} />
          <OrbitControls makeDefault />
        </Canvas>
        <div className="telemetry-bar">
          <span>MODE: {uiState?.route?.toUpperCase() || 'HOVER'}</span>
          <span>ALT: {uiState?.altitude?.toFixed(1) || 0}m</span>
          {uiState?.spinning && <span style={{ color: '#ff6600' }}>🌀 SPIN</span>}
        </div>
      </div>

      <div className="right-panel">
        <div className="control-section">
          {uiState?.is_playing ? 
            <button className="btn-danger" onClick={() => sendCommand('toggle_play')}>STOP SIMULATION</button> : 
            <button className="btn-primary" onClick={() => sendCommand('toggle_play')}>START SIMULATION</button>
          }
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            <button style={btnActionStyle()} onClick={() => sendCommand('console_cmd', undefined, 'takeoff')}>TAKEOFF</button>
            <button style={btnActionStyle()} onClick={() => sendCommand('console_cmd', undefined, 'land')}>LAND</button>
            <button style={btnActionStyle()} onClick={() => sendCommand('console_cmd', undefined, 'spin')}>SPIN</button>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <button 
              style={btnActionStyle(uiState?.turbo)} 
              onClick={() => sendCommand('console_cmd', undefined, uiState?.turbo ? 'normal' : 'turbo')}
            >
              {uiState?.turbo ? '⚡ TURBO' : 'TURBO'}
            </button>
            <button 
              style={btnActionStyle()} 
              onClick={() => sendCommand('console_cmd', undefined, 'battery')}
            >BATTERY</button>
          </div>

          <div style={{marginTop: '10px', marginBottom: '5px', textAlign: 'center', fontSize: '10px', color: '#555', letterSpacing: '2px'}}>MANUAL CONTROL (HOLD)</div>
          
          <div className="dpad-container">
            <div className="dpad-empty"></div>
            <button className="dpad-btn" onMouseDown={() => sendCommand('start_move', 'up')} onMouseUp={() => sendCommand('stop_move', 'up')} onMouseLeave={() => sendCommand('stop_move', 'up')}>▲</button>
            <div className="dpad-empty"></div>
            
            <button className="dpad-btn" onMouseDown={() => sendCommand('start_move', 'left')} onMouseUp={() => sendCommand('stop_move', 'left')} onMouseLeave={() => sendCommand('stop_move', 'left')}>◄</button>
            <button className="dpad-btn" onMouseDown={() => sendCommand('start_move', 'down')} onMouseUp={() => sendCommand('stop_move', 'down')} onMouseLeave={() => sendCommand('stop_move', 'down')}>▼</button>
            <button className="dpad-btn" onMouseDown={() => sendCommand('start_move', 'right')} onMouseUp={() => sendCommand('stop_move', 'right')} onMouseLeave={() => sendCommand('stop_move', 'right')}>►</button>
          </div>
          
          <div className="dpad-row">
            <button className="dpad-btn" onMouseDown={() => sendCommand('start_move', 'forward')} onMouseUp={() => sendCommand('stop_move', 'forward')} onMouseLeave={() => sendCommand('stop_move', 'forward')}>FWD</button>
            <button className="dpad-btn" onMouseDown={() => sendCommand('start_move', 'back')} onMouseUp={() => sendCommand('stop_move', 'back')} onMouseLeave={() => sendCommand('stop_move', 'back')}>BACK</button>
            <button className="dpad-btn" onClick={() => sendCommand('console_cmd', undefined, 'hover')} style={{color: '#00ffff', borderColor: '#00ffff'}}>HOVR</button>
          </div>

          <button className="btn-danger" style={{marginTop: '5px'}} onClick={() => sendCommand('console_cmd', undefined, 'reset')}>RESET TO HOME</button>

          <div className="slider-group" style={{marginTop: '15px'}}>
            <label>ROTATION <span className="pink">{uiState?.rotation?.toFixed(0) || 0}°</span></label>
            <input type="range" min="0" max="360" value={uiState?.rotation || 0} onChange={(e) => sendCommand('set_rotation', Number(e.target.value))} disabled={!isConnected} />
          </div>
          <div className="slider-group">
            <label>SPEED <span className="pink">{uiState?.speed || 0}%</span></label>
            <input type="range" min="0" max="100" value={uiState?.speed || 0} onChange={(e) => sendCommand('set_speed', Number(e.target.value))} disabled={!isConnected} />
          </div>
          <div className="slider-group">
            <label>ALTITUDE <span className="pink">{uiState?.altitude?.toFixed(1) || 0}m</span></label>
            <input type="range" min="0" max="10" step="0.1" value={uiState?.altitude || 0} onChange={(e) => sendCommand('set_altitude', Number(e.target.value))} disabled={!isConnected} />
          </div>
        </div>

        <div className="console-section">
          <div className="console-header">SYSTEM TERMINAL</div>
          <div className="console-log">
            {uiState?.logs?.map((log: string, i: number) => <div key={i}><span className="cyan">&gt;</span> {log}</div>)}
          </div>
          <form onSubmit={handleSubmit} className="console-input">
            <input type="text" value={consoleInput} onChange={(e) => setConsoleInput(e.target.value)} placeholder="Type 'help' for all commands..." disabled={!isConnected} />
            <button type="submit" disabled={!isConnected}><Send size={14} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}