import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Terminal, Activity, Radio, Cpu, Lock, Volume2, VolumeX, FastForward, Scan, Satellite, Eye, AlertTriangle } from 'lucide-react';
import { audioFx } from '../utils/audioFx.js';

interface SystemBootLoaderProps {
  onComplete: () => void;
}

interface BootStage {
  tag: string;
  command: string;
  desc: string;
  metric: string;
}

const BOOT_STAGES: BootStage[] = [
  {
    tag: 'BOOT-01',
    command: 'aegis-kernel --init --crypto=AES-256-GCM --accel=HW_SSE4',
    desc: 'COLD BOOT KERNEL // CRYPTOGRAPHIC CO-PROCESSOR INITIALIZED',
    metric: 'SHA-256 ENGINE: 14.8 GB/s',
  },
  {
    tag: 'RAD-02',
    command: 'azimuth-radar --bind 0.0.0.0 --frequency=4.2GHz --sweep=360',
    desc: '360° AZIMUTH RADAR & TACTICAL SENSOR MESH CALIBRATED',
    metric: 'SWEEP: 360° LOCK [NORAD-SEC-4]',
  },
  {
    tag: 'SAT-03',
    command: 'satcom-uplink --target=ORBIT_SAT_9B --uplink=MIL-Ku --cipher=ECDH',
    desc: 'ORBITAL SATELLITE TELEMETRY LINK ESTABLISHED [ALT: 35,786 KM]',
    metric: 'CARRIER SNR: 38.4 dB [STABLE]',
  },
  {
    tag: 'FEED-04',
    command: 'ingest-socket --sources=REDDIT_LIVE,X_TWITTER_STREAM --rate=120/s',
    desc: 'CONNECTING PUBLIC SOCIAL FEEDS // REAL-TIME INGESTION SOCKETS',
    metric: 'INGESTION: 120 PKTS/SEC',
  },
  {
    tag: 'AI-05',
    command: 'neural-tokenizer --model=AST_V4_EVASION --threads=16 --lexicon=ALL',
    desc: 'NEURAL AST TOKENIZER & ALGORITHMIC EVASION ENGINE COMPILED',
    metric: 'EVASION LEXICON: 4,892 TERMS',
  },
  {
    tag: 'LEDG-06',
    command: 'ledger-audit --mount /dev/crypt0 --verify-merkle --strict',
    desc: 'CRYPTOGRAPHIC SHA-256 TAMPER-EVIDENT AUDIT LEDGER MOUNTED',
    metric: 'MERKLE INTEGRITY: 100% UNBROKEN',
  },
  {
    tag: 'BIO-07',
    command: 'biometric-auth --retinal --fingerprint --user=BLACK_HAT_07',
    desc: 'BIOMETRIC IRIS & RETINAL MATCH CONFIRMED: OPERATOR BLACK_HAT_07',
    metric: 'CONFIDENCE: 99.87% [ROOT 0x00FF]',
  },
  {
    tag: 'DEF-08',
    command: 'defcon-arm --level=2 --airgap-ready --hot-trigger=ACTIVE',
    desc: 'DEFCON 2 ARMED // CYBER AIRGAP DEFENSE AUTOMATION ENGAGED',
    metric: 'STATUS: WARFARE READY',
  },
];

const CIPHER_STRINGS = [
  'DECRYPTING OPERATIONAL AIRGAP SUITE...',
  'BYPASSING PERIMETER FIREWALL PROXIES...',
  'SYNCHRONIZING SATELLITE AZIMUTH 360°...',
  'COMPILING NEURAL SYNTACTIC AST NODES...',
  'VERIFYING NONCE 0x90B2F7 IN AUDIT CHAIN...',
  'ROOT AUTHENTICATION CONFIRMED: 0x00FF',
];

export const SystemBootLoader: React.FC<SystemBootLoaderProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(4);
  const [hexLogs, setHexLogs] = useState<string[]>([]);
  const [cipherText, setCipherText] = useState(CIPHER_STRINGS[0]);
  const [biometricStatus, setBiometricStatus] = useState('SCANNING RETINAL PATTERN...');
  const [defconLevel, setDefconLevel] = useState(5);
  const [audioMuted, setAudioMuted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, azimuth: 180 });

  // Sound Synthesizer Loop
  useEffect(() => {
    try {
      audioFx.playThreatScan();
      audioFx.playBiometricLaser();
    } catch {}

    const keyInterval = setInterval(() => {
      if (!audioMuted && Math.random() > 0.35) {
        audioFx.playHackerKey();
      }
    }, 120);

    return () => clearInterval(keyInterval);
  }, [audioMuted]);

  // Scrambling Cipher Text Generator
  useEffect(() => {
    const chars = '0123456789ABCDEF!@#$%&*<>{}[]~/\\';
    const target = CIPHER_STRINGS[Math.min(currentStageIdx, CIPHER_STRINGS.length - 1)];
    let iteration = 0;

    const interval = setInterval(() => {
      setCipherText(
        target
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return target[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= target.length) {
        clearInterval(interval);
      }
      iteration += 1.5;
    }, 30);

    return () => clearInterval(interval);
  }, [currentStageIdx]);

  // 3D Canvas Matrix & Orbital Satellite Geospatial Sphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Matrix Rain Columns
    const cols = Math.floor(width / 22);
    const drops = Array.from({ length: cols }).map(() => Math.floor(Math.random() * -60));
    const matrixChars = '0123456789ABCDEF0X00FFDEFCONAEGISΩΨЖ§±';

    // 3D Wireframe Globe Variables
    const globeRadius = Math.min(width, height) * 0.26;
    let globeAngle = 0;
    let satAngle1 = 0;
    let satAngle2 = Math.PI;
    let wavePhase = 0;
    let rippleTimer = 0;
    let packetTimer = 0;

    // Worldwide Cyber Nodes for blue interconnected network lines
    const cyberNodes = [
      { name: 'US-EAST', lat: 0.65, lon: 4.8, conns: [1, 2, 4, 7] },
      { name: 'EU-CENTRAL', lat: 0.85, lon: 0.2, conns: [0, 2, 3, 6] },
      { name: 'ASIA-EAST', lat: 0.6, lon: 2.4, conns: [1, 3, 5] },
      { name: 'AP-SOUTH', lat: 0.3, lon: 1.4, conns: [1, 2, 5] },
      { name: 'SA-BRAZIL', lat: -0.4, lon: 5.4, conns: [0, 1] },
      { name: 'AU-SYDNEY', lat: -0.6, lon: 2.7, conns: [2, 3] },
      { name: 'AFRICA-NORTH', lat: 0.4, lon: 0.5, conns: [1, 3] },
      { name: 'US-WEST', lat: 0.62, lon: 4.1, conns: [0, 2] },
    ];

    // Blinking Red Threat Beacons Around Globe
    const threatBeacons = [
      { id: 'TGT-01', lat: 0.55, lon: 1.8, label: 'INTRUSION_01', speed: 1.4 },
      { id: 'TGT-02', lat: -0.2, lon: 3.9, label: 'DDOS_FLOOD', speed: 2.0 },
      { id: 'TGT-03', lat: 0.9, lon: 5.1, label: 'MALWARE_C2', speed: 1.2 },
      { id: 'TGT-04', lat: 0.1, lon: 0.8, label: 'HOSTILE_NODE', speed: 1.8 },
      { id: 'TGT-05', lat: -0.5, lon: 2.1, label: 'RANSOM_VECTOR', speed: 2.3 },
      { id: 'TGT-06', lat: 0.72, lon: 3.2, label: 'EXPLOIT_90B', speed: 1.6 },
    ];

    const render = () => {
      // Trail fade
      ctx.fillStyle = 'rgba(6, 9, 19, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // 1. Digital Matrix Rain
      ctx.font = '10px monospace';
      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * 22;
        const y = drops[i] * 18;

        if (y > 0 && y < height) {
          ctx.fillStyle = i % 8 === 0 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(0, 240, 255, 0.12)';
          ctx.fillText(char, x, y);
        }

        if (drops[i] * 18 > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // 2. Center 3D Orbital Wireframe Globe
      const cx = width * 0.5;
      const cy = height * 0.42;
      globeAngle += 0.01;
      satAngle1 += 0.022;
      satAngle2 += 0.016;

      ctx.save();
      ctx.translate(cx, cy);

      // Rotating Compass Azimuth Degree Ring
      ctx.save();
      ctx.rotate(-globeAngle * 0.4);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, globeRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      // Degree Tick Marks
      for (let d = 0; d < 360; d += 30) {
        const rad = (d * Math.PI) / 180;
        const r1 = globeRadius * 1.35;
        const r2 = globeRadius * (d % 90 === 0 ? 1.42 : 1.38);
        ctx.strokeStyle = d % 90 === 0 ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(r1 * Math.cos(rad), r1 * Math.sin(rad));
        ctx.lineTo(r2 * Math.cos(rad), r2 * Math.sin(rad));
        ctx.stroke();
      }
      ctx.restore();

      // 3D Latitudes
      const latitudes = 12;
      for (let i = 0; i <= latitudes; i++) {
        const theta = (i * Math.PI) / latitudes - Math.PI / 2;
        const r = globeRadius * Math.cos(theta);
        const y = globeRadius * Math.sin(theta);

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.28)' : 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.ellipse(0, y, r, r * 0.36, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3D Longitudes
      const longitudes = 18;
      for (let i = 0; i < longitudes; i++) {
        const phi = (i * 2 * Math.PI) / longitudes + globeAngle;
        const xRad = globeRadius * Math.cos(phi);

        ctx.strokeStyle = i % 3 === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 240, 255, 0.08)';
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.abs(xRad), globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Satellite 1 Orbit & Beam
      const sat1R = globeRadius * 1.55;
      const s1x = sat1R * Math.cos(satAngle1);
      const s1y = (sat1R * 0.4) * Math.sin(satAngle1);

      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(s1x, s1y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Laser Targeting Beam from Sat 1 to Earth
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite 2 (Military Amber Recon)
      const sat2R = globeRadius * 1.7;
      const s2x = (sat2R * 0.8) * Math.cos(satAngle2);
      const s2y = sat2R * Math.sin(satAngle2);

      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s2x, s2y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // --- 1. GREEN RADAR RIPPLES & ROTATING SWEEP CONE ---
      rippleTimer += 1.4;
      const maxRippleR = globeRadius * 1.55;
      const numRipples = 4;
      for (let r = 0; r < numRipples; r++) {
        const curR = (rippleTimer + r * (maxRippleR / numRipples)) % maxRippleR;
        const progress = curR / maxRippleR;
        const alpha = Math.max(0, (1 - progress) * 0.7);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, curR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Green Radar Sweep Beam & Translucent Sector
      const radarSweepAngle = (rippleTimer * 0.035) % (Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, globeRadius * 1.35, radarSweepAngle - 0.45, radarSweepAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(globeRadius * 1.35 * Math.cos(radarSweepAngle), globeRadius * 1.35 * Math.sin(radarSweepAngle));
      ctx.stroke();

      // --- 2. BLUE INTERCONNECTED LINES ALONG THE GLOBE ---
      packetTimer += 0.012;
      const projectedNodes = cyberNodes.map((node, i) => {
        const phi = node.lon + globeAngle;
        const x = globeRadius * Math.cos(node.lat) * Math.sin(phi);
        const y = -globeRadius * Math.sin(node.lat);
        const z = globeRadius * Math.cos(node.lat) * Math.cos(phi);
        return { ...node, x, y, z, id: i };
      });

      // Draw Arced Blue Network Interconnections
      projectedNodes.forEach(nodeA => {
        nodeA.conns.forEach(targetIdx => {
          const nodeB = projectedNodes[targetIdx];
          if (!nodeB || nodeA.id >= nodeB.id) return;

          // Render line if at least one node is front-facing or near horizon
          if (nodeA.z > -globeRadius * 0.25 || nodeB.z > -globeRadius * 0.25) {
            const midX = (nodeA.x + nodeB.x) * 0.5;
            const midY = (nodeA.y + nodeB.y) * 0.5;
            const dist = Math.hypot(midX, midY) || 1;
            const bowR = globeRadius * 1.16;
            const ctrlX = (midX / dist) * bowR;
            const ctrlY = (midY / dist) * bowR;

            // Electric Blue Line
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.quadraticCurveTo(ctrlX, ctrlY, nodeB.x, nodeB.y);
            ctx.stroke();

            // Animated Traveling Photon Data Packet
            const t = (packetTimer + (nodeA.id + nodeB.id) * 0.16) % 1;
            const px = (1 - t) ** 2 * nodeA.x + 2 * (1 - t) * t * ctrlX + t ** 2 * nodeB.x;
            const py = (1 - t) ** 2 * nodeA.y + 2 * (1 - t) * t * ctrlY + t ** 2 * nodeB.y;

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      });

      // Draw Glowing Blue Nodes
      projectedNodes.forEach(node => {
        if (node.z > -globeRadius * 0.15) {
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // --- 3. BLINKING RED THREAT LIGHTS AROUND THE GLOBE ---
      threatBeacons.forEach(beacon => {
        const phi = beacon.lon + globeAngle;
        const x = globeRadius * Math.cos(beacon.lat) * Math.sin(phi);
        const y = -globeRadius * Math.sin(beacon.lat);
        const z = globeRadius * Math.cos(beacon.lat) * Math.cos(phi);

        if (z > -globeRadius * 0.15) {
          const blinkPhase = Math.sin(Date.now() * 0.007 * beacon.speed);
          const isBlinking = blinkPhase > 0;
          const haloR = 5 + (blinkPhase + 1) * 3.5;

          if (isBlinking) {
            // Pulsing Red Halo
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, haloR, 0, Math.PI * 2);
            ctx.stroke();

            // Intense Red Beacon Dot
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Hostile Warning Label
            ctx.fillStyle = '#fca5a5';
            ctx.font = '8px monospace';
            ctx.fillText(`! ${beacon.label}`, x + 9, y + 2);
          } else {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Red Target Lock Reticle
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-24, 0);
      ctx.lineTo(24, 0);
      ctx.moveTo(0, -24);
      ctx.lineTo(0, 24);
      ctx.stroke();

      ctx.restore();

      // 3. Audio Frequency Oscilloscope Waveform at Bottom
      wavePhase += 0.08;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 6) {
        const waveY = height - 12 - Math.sin(x * 0.02 + wavePhase) * 10 - Math.cos(x * 0.05 - wavePhase * 1.5) * 6;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();

      // 4. Interactive Tactical Mouse Crosshair
      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mx, my, 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(mx, my, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(mx - 32, my);
      ctx.lineTo(mx + 32, my);
      ctx.moveTo(mx, my - 32);
      ctx.lineTo(mx, my + 32);
      ctx.stroke();

      ctx.fillStyle = '#00f0ff';
      ctx.font = '9px monospace';
      ctx.fillText(`AZ: ${mousePos.current.azimuth}° // TGT: 0x${Math.floor(mx).toString(16).toUpperCase()}`, mx + 36, my - 6);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Step Sequencer
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStageIdx(prev => {
        const next = prev + 1;

        if (next < BOOT_STAGES.length) {
          setProgress(Math.round(((next + 1) / BOOT_STAGES.length) * 100));

          // DEFCON state progression
          if (next >= 6) setDefconLevel(2);
          else if (next >= 4) setDefconLevel(3);
          else if (next >= 2) setDefconLevel(4);

          // Biometric status updates
          if (next === 2) setBiometricStatus('CORRELATING NORAD SATELLITE VECTORS...');
          if (next === 4) setBiometricStatus('SYNCHRONIZING REDDIT & X INGESTION SOCKETS...');
          if (next === 6) {
            setBiometricStatus('BIOMETRIC RETINAL MATCH: 99.87% // IDENTITY VERIFIED');
            audioFx.playBiometricLaser();
          }
          if (next === 7) {
            setBiometricStatus('ACCESS AUTHORIZED: BLACK_HAT_07 // DEFCON 2 ARMED');
          }

          // Random glitch flash
          if (Math.random() > 0.6) {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 90);
          }

          // Hex memory generator
          const generated = Array.from({ length: 3 }).map(() =>
            `0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0')} ` +
            `[${Math.floor(Math.random() * 0xffff).toString(16).toUpperCase()}] ` +
            `VECTOR_ALLOC_${Math.floor(Math.random() * 999)} -> VERIFIED`
          );
          setHexLogs(generated);

          return next;
        } else {
          clearInterval(stageInterval);
          setProgress(100);
          audioFx.playCinematicBoom();
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 550);
          return prev;
        }
      });
    }, 280);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        fastBypass();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(stageInterval);
      window.removeEventListener('keydown', onKey);
    };
  }, [onComplete]);

  const fastBypass = () => {
    audioFx.playCinematicBoom();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 150);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePos.current.x = e.clientX;
    mousePos.current.y = e.clientY;
    const centerDiffX = e.clientX - window.innerWidth / 2;
    const centerDiffY = e.clientY - window.innerHeight / 2;
    let deg = Math.round((Math.atan2(centerDiffY, centerDiffX) * 180) / Math.PI) + 90;
    if (deg < 0) deg += 360;
    mousePos.current.azimuth = deg;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[100] bg-[#050811] text-[#dde2f8] font-mono select-none overflow-hidden transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-110 pointer-events-none filter blur-sm' : 'opacity-100 scale-100'
      } ${glitchActive ? 'translate-x-1 filter invert-20' : ''}`}
    >
      {/* 3D Wireframe Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />

      {/* Screen Vignette & CRT Cathode Lines */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,17,0.7)_70%,rgba(0,0,0,0.95)_100%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.7)_50%)] bg-[length:100%_4px]" />

      {/* Top Sci-Fi Military HUD Bar */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex flex-wrap justify-between items-center z-20 border-b border-[#00f0ff]/20 bg-black/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xs border border-[#00f0ff] bg-[#00f0ff]/15 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Shield className="w-5 h-5 text-[#00f0ff] animate-pulse" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold tracking-widest text-white flex items-center gap-2">
              <span>AEGIS TACTICAL DEFENSE MATRIX</span>
              <span className="text-[10px] px-2 py-0.5 rounded-2xs bg-red-950/60 text-red-400 border border-red-500/40 font-bold uppercase tracking-wider animate-pulse">
                DEFCON {defconLevel}
              </span>
            </div>
            <div className="text-[10px] text-[#849495] tracking-widest uppercase flex items-center gap-2">
              <span>MIL-SPEC KERNEL v4.18.2</span>
              <span>//</span>
              <span className="text-[#00f0ff]">SECURE CRYPTO-BUS: 0x00FF</span>
            </div>
          </div>
        </div>

        {/* Real-time Status Badges & Controls */}
        <div className="flex items-center gap-3 text-xs">
          {/* Orbital Satellite Uplink Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xs border border-[#00f0ff]/30 bg-black/60 text-[11px]">
            <Satellite className="w-3.5 h-3.5 text-[#00f0ff] animate-spin" />
            <span className="text-[#849495]">SAT_UPLINK:</span>
            <span className="text-emerald-400 font-bold">NORAD-9B [35,786 KM]</span>
          </div>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={() => {
              setAudioMuted(!audioMuted);
              audioFx.enabled = audioMuted;
            }}
            title="Toggle cyber synthesizer sound"
            className="p-1.5 rounded-xs border border-white/20 hover:border-[#00f0ff] bg-black/60 text-[#849495] hover:text-white transition-all cursor-pointer"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00f0ff]" />}
          </button>

          {/* Fast-Forward Button */}
          <button
            onClick={fastBypass}
            title="Bypass boot sequence (Spacebar / Esc)"
            className="px-3 py-1.5 rounded-xs border border-[#00f0ff] bg-[#00f0ff]/20 hover:bg-[#00f0ff]/35 text-[#00f0ff] hover:text-white text-xs font-bold tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
          >
            <span>BYPASS SEQUENCE</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hollywood Sci-Fi Top Right Satellite Recon Box */}
      <div className="hidden md:block absolute top-20 right-6 z-20 w-64 bg-black/80 border border-[#00f0ff]/30 p-3 rounded-xs shadow-[0_0_20px_rgba(0,240,255,0.15)] backdrop-blur-xs text-[10px]">
        <div className="flex justify-between items-center text-[#00f0ff] font-bold pb-1 mb-1.5 border-b border-white/10 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#00f0ff] animate-pulse" />
            ORBITAL BEAM SCAN
          </span>
          <span className="text-emerald-400">LOCKED</span>
        </div>
        <div className="space-y-1 text-[#849495]">
          <div>TARGET: <span className="text-white">SECTOR 0x7A [US-EAST]</span></div>
          <div>DOPPLER SHIFT: <span className="text-cyan-400 font-bold">+4.2 kHz</span></div>
          <div>CARRIER FREQ: <span className="text-white">4.20 GHz Ku-BAND</span></div>
          <div>BEARING: <span className="text-emerald-400 font-bold">{mousePos.current.azimuth}° AZIMUTH</span></div>
        </div>
      </div>

      {/* Hollywood Sci-Fi Top Left Biometric Laser Box */}
      <div className="hidden md:block absolute top-20 left-6 z-20 w-72 bg-black/80 border border-[#00f0ff]/30 p-3 rounded-xs shadow-[0_0_20px_rgba(0,240,255,0.15)] backdrop-blur-xs text-[10px]">
        <div className="flex justify-between items-center text-[#00f0ff] font-bold pb-1 mb-1.5 border-b border-white/10 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Scan className="w-3 h-3 text-[#00f0ff] animate-pulse" />
            BIOMETRIC SCANNER
          </span>
          <span className="text-[#00f0ff] font-bold">{progress}%</span>
        </div>
        {/* Animated Laser Bar */}
        <div className="relative h-12 bg-black/90 rounded-xs border border-white/10 overflow-hidden flex items-center justify-center mb-1.5">
          <Eye className="w-7 h-7 text-[#00f0ff]/40" />
          <div className="absolute inset-x-0 h-0.5 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-bounce" />
        </div>
        <div className="text-[#dde2f8] font-bold tracking-tight text-[11px] truncate">
          {biometricStatus}
        </div>
      </div>

      {/* Main Bottom Tactical Terminal HUD Window */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 pb-6 z-20 max-w-5xl mx-auto">
        <div className="bg-black/85 border border-[#00f0ff]/50 p-5 rounded-xs shadow-[0_0_40px_rgba(0,240,255,0.25)] backdrop-blur-md relative overflow-hidden">
          {/* Sci-Fi Tech Corner Brackets */}
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00f0ff]" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00f0ff]" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00f0ff]" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00f0ff]" />

          {/* Scrambled Cipher Decryption Stream Header */}
          <div className="flex flex-wrap justify-between items-center pb-2.5 mb-3 border-b border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span className="font-extrabold text-[#00f0ff] tracking-widest uppercase">
                {cipherText}
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>DEFCON 2 // AIRGAP ACTIVE</span>
            </div>
          </div>

          {/* Active Terminal Commands Output */}
          <div className="space-y-1.5 mb-3 min-h-[135px] max-h-[160px] overflow-y-auto pr-1">
            {BOOT_STAGES.slice(0, currentStageIdx + 1).map((stage, idx) => {
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stage.tag}
                  className={`text-xs p-1.5 rounded-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                    isCurrent
                      ? 'bg-[#00f0ff]/15 border-l-2 border-[#00f0ff] text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'text-[#849495] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#00f0ff] text-[10px] font-bold">[{stage.tag}]</span>
                    <span className={isCurrent ? 'text-white font-bold' : 'text-[#dde2f8]'}>
                      {stage.desc}
                    </span>
                  </div>
                  <div className="text-[10px] text-cyan-400/90 font-mono sm:text-right">
                    {stage.metric}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hex Memory Stream */}
          <div className="bg-black/90 p-2 rounded-xs border border-white/5 mb-3 text-[10px] text-cyan-400/80 font-mono flex flex-wrap gap-x-5 gap-y-1">
            {hexLogs.map((h, i) => (
              <span key={i} className="tracking-wider">{h}</span>
            ))}
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-2">
                <Activity className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
                <span className="text-white font-bold tracking-wider uppercase">
                  SYSTEM INITIALIZATION: {progress}%
                </span>
              </div>
              <span className="text-base font-extrabold text-[#00f0ff] font-mono">
                {progress === 100 ? 'ACCESS GRANTED' : `${progress}%`}
              </span>
            </div>

            {/* Glowing Segmented Matrix Bar */}
            <div className="w-full h-3 bg-black border border-white/20 p-0.5 rounded-xs relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 via-[#00f0ff] to-emerald-400 transition-all duration-200 shadow-[0_0_16px_rgba(0,240,255,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer Navigation Tip */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap justify-between items-center text-[10px] text-[#849495]">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>CLEARANCE: <strong className="text-white">BLACK_HAT_07 // LEVEL 4 ROOT</strong></span>
            </div>
            <div className="tracking-widest uppercase text-[#00f0ff] animate-pulse">
              [ PRESS SPACEBAR OR CLICK BYPASS TO ENTER HUD ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
