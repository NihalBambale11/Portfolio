import React, { Suspense, useState, useEffect } from 'react'
import { Canvas , useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Html, Sparkles, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { Model } from './Setup'
import './App.css'

// ==========================================
// 1. DATA MODELS
// ==========================================
const PROJECTS = [
  {
    id: 'v4l2-zerocopy',
    title: 'Zero-Copy V4L2 Video Capture Pipeline',
    category: 'Linux Kernel & SoC',
    tech: ['C', 'C++', 'Embedded Linux', 'V4L2', 'Custom IOCTL', 'DMA Zero-Copy', 'Multithreading'],
    description: 'Designed a zero-copy video capture path interfacing with the V4L2 subsystem using memory-mapped and DMA buffer sharing to eliminate redundant copies between capture and encode stages.',
    metrics: 'Eliminated CPU frame-copy overhead across long-duration capture runs.'
  },
  {
    id: 'rt-multimedia',
    title: 'Real-Time Multimedia Streaming Server',
    category: 'Network & Compression',
    tech: ['C++', 'Live555', 'RTP/UDP', 'RTSP', 'TurboJPEG', 'Opus', 'Sockets', 'GDB'],
    description: 'End-to-end low-latency audio-video streaming server on a custom SoC platform delivering compressed TurboJPEG video and Opus audio over RTP/UDP to RTSP clients.',
    metrics: 'Full session management, packetization, and A/V sync optimization.'
  },
  {
    id: 'qt-qml-client',
    title: 'Qt/QML Real-Time Streaming Client & RJNViewer',
    category: 'Cross-Platform UI & Media',
    tech: ['C++', 'Qt 6', 'QML', 'Signals & Slots', 'RTP/UDP', 'ALSA', 'Embedded Linux'],
    description: 'Cross-platform client application with a multithreaded C++ backend and Qt/QML frontend to receive, decode, and render live streams with synchronized ALSA audio playback.',
    metrics: 'Threaded rendering & responsive real-time stream control.'
  },
  {
    id: 'savevault',
    title: 'SaveVault Security System',
    category: 'Desktop Security',
    tech: ['C++', 'Qt 6', 'QML', 'CMake', 'SQLite'],
    description: 'Desktop security vault application featuring user authentication, OTP verification, and local encrypted data management.',
    metrics: 'Zero-dependency local SQLite storage with hardware-accelerated QML UI.'
  },
  {
    id: 'compassly',
    title: 'Compassly AI Trip Planner',
    category: 'Full-Stack Web & AI',
    tech: ['React', 'Spring Boot', 'MongoDB', 'Gemini API', 'JavaScript'],
    description: 'Full-stack smart travel itinerary generator built during PG-DAC featuring dynamic route planning and generative AI recommendations.',
    metrics: 'RESTful microservice architecture with responsive web frontend.'
  }
]

const SKILL_TREES = {
  systems: {
    name: 'CORE SYSTEMS // C++ & EMBEDDED LINUX',
    color: '#ff3366',
    loadoutBonus: '+40% Low-Level Execution Speed & Memory Safety',
    nodes: [
      { id: 'cpp', name: 'C / C++', rank: '5/5 ★', desc: 'HackerRank 5-Star Gold rating. Heavy production use in embedded SoC apps, STL, and real-time pipelines.' },
      { id: 'linux', name: 'Embedded Linux & SoC', rank: '5/5', desc: 'User-space application development, custom SoC bring-up, and hardware-software validation.' },
      { id: 'mt', name: 'Multithreading & IPC', rank: '5/5', desc: 'Thread synchronization, lock-free queues, and inter-process communication for real-time A/V pipelines.' },
      { id: 'mem', name: 'Memory Management', rank: '5/5', desc: 'Custom buffer lifecycles, zero-copy architectures, pointer safety, and leak elimination.' },
      { id: 'dsa', name: 'DSA & OOPS', rank: '4/5', desc: 'Object-oriented system architecture, design patterns, and algorithmic problem solving.' }
    ]
  },
  multimedia: {
    name: 'STREAMING // MEDIA & NETWORK PROTOCOLS',
    color: '#00ccff',
    loadoutBonus: '+35% Network Throughput & Sub-Frame Latency',
    nodes: [
      { id: 'v4l2', name: 'V4L2 & Custom IOCTLs', rank: '5/5', desc: 'Direct camera driver interaction, memory-mapped buffers, and DMA zero-copy capture pipelines.' },
      { id: 'rtp', name: 'Live555 / RTP / UDP / RTSP', rank: '5/5', desc: 'Custom packetization, session management, and ultra-low-latency network transport.' },
      { id: 'codecs', name: 'TurboJPEG & Opus', rank: '5/5', desc: 'Real-time video frame compression and low-bitrate synchronized audio encoding.' },
      { id: 'alsa', name: 'ALSA Audio Subsystem', rank: '4/5', desc: 'Linux hardware audio capture and playback integration with A/V sync.' },
      { id: 'sockets', name: 'Socket Programming', rank: '4/5', desc: 'Raw UDP/TCP network sockets, endpoint discovery, and stream routing.' }
    ]
  },
  interface: {
    name: 'INTERFACE // UI, FULL-STACK & DB',
    color: '#00ffcc',
    loadoutBonus: '+30% Cross-Platform UI Responsiveness',
    nodes: [
      { id: 'qt', name: 'Qt 6 & QML', rank: '5/5', desc: 'Hardware-accelerated UI interfaces coupled with high-performance C++ backends.' },
      { id: 'signals', name: 'Signals, Slots & Qt Widgets', rank: '5/5', desc: 'Event-driven cross-thread communication between media decoders and UI layers.' },
      { id: 'java', name: 'Java & Spring Boot', rank: '4/5 ★', desc: 'HackerRank 4-Star rating. Full-stack enterprise backend services and REST APIs.' },
      { id: 'sql', name: 'SQL (MySQL / Oracle)', rank: '4/5 ★', desc: 'HackerRank 4-Star rating. Relational schema design and optimized queries.' },
      { id: 'web', name: 'React, JS & Three.js', rank: '4/5', desc: 'Interactive 3D web interfaces, HTML5/CSS3, and modern frontend state management.' }
    ]
  },
  tooling: {
    name: 'TACTICAL TOOLS // DEBUGGING & BUILD',
    color: '#ffcc00',
    loadoutBonus: '+50% Root-Cause Detection & Profiling Precision',
    nodes: [
      { id: 'gdb', name: 'GDB & Valgrind', rank: '5/5', desc: 'Crash dump analysis, memory leak detection, and race condition debugging.' },
      { id: 'wireshark', name: 'Wireshark & strace', rank: '5/5', desc: 'Deep RTP/UDP packet inspection, network jitter analysis, and Linux syscall tracing.' },
      { id: 'cmake', name: 'CMake, Make & GCC', rank: '5/5', desc: 'Cross-compilation toolchains and automated build systems for Linux & Windows.' },
      { id: 'ffmpeg', name: 'FFmpeg & VLC', rank: '4/5', desc: 'Stream validation, container inspection, and media pipeline benchmarking.' },
      { id: 'git', name: 'Git, GitHub & GitLab', rank: '5/5', desc: 'Version control, code reviews, unit/integration testing, and Agile workflows.' }
    ]
  }
}

// ==========================================
// 2. BOOT SEQUENCE COMPONENT
// ==========================================
function BootSequence() {
  const { progress } = useProgress()
  const [isVisible, setIsVisible] = useState(true)
  const [forcedWait, setForcedWait] = useState(true)

  // Force the cinematic terminal to stay for at least 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setForcedWait(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Fade out only when BOTH the model is loaded AND the forced wait is over
  useEffect(() => {
    if (progress === 100 && !forcedWait) {
      const fadeTimer = setTimeout(() => setIsVisible(false), 800)
      return () => clearTimeout(fadeTimer)
    }
  }, [progress, forcedWait])

  if (!isVisible) return null

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#0b0c10', zIndex: 99999, display: 'flex', 
      flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      color: '#00ffcc', fontFamily: 'monospace',
      opacity: (progress === 100 && !forcedWait) ? 0 : 1, 
      transition: 'opacity 0.8s ease-out', pointerEvents: 'none'
    }}>
      <div style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <h2 style={{ color: '#ff3366', margin: '0 0 20px 0', letterSpacing: '2px', fontSize: '1.4rem' }}>
          [ NIHAL_OS : v2.4 ]
        </h2>
        <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>&gt; SYSTEM_BOOT_SEQUENCE_INITIATED...</p>
        <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>&gt; LOADING V4L2 DRIVERS... [ OK ]</p>
        <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>&gt; ESTABLISHING SECURE UPLINK... [ OK ]</p>
        <p style={{ margin: '8px 0', color: '#ffcc00', fontSize: '0.9rem' }}>
          &gt; MOUNTING 3D ENGINE... {Math.round(progress)}%
        </p>
        
        {/* Loading Bar */}
        <div style={{ width: '100%', height: '18px', border: '2px solid #00ffcc', marginTop: '25px', padding: '2px', boxSizing: 'border-box' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#00ffcc', transition: 'width 0.2s ease' }} />
        </div>
        
        {/* Success Message */}
        {progress === 100 && !forcedWait && (
          <p style={{ margin: '25px 0', color: '#00ffcc', fontWeight: 'bold', textShadow: '0 0 10px #00ffcc' }}>
            &gt; ACCESS GRANTED. ENTERING THE GRID...
          </p>
        )}
      </div>
    </div>
  )
}

// ==========================================
// CINEMATIC CAMERA CONTROLLER
// ==========================================
function CameraController({ activeModal }) {
  useFrame((state, delta) => {
    // Default position (sitting at the desk)
    const targetPos = new THREE.Vector3(-0.4, 1.4, 4.2)

    if (activeModal === 'projects') {
      // Fly left, zoom in on the Monitor
      targetPos.set(-1.2, 1.5, 2.0)
    } else if (activeModal === 'skills') {
      // Fly right, zoom in on the glowing PC Tower
      targetPos.set(1.2, 1.3, 2.2)
    } else if (activeModal === 'dossier') {
      // Fly up, look down at the Keyboard/Mouse
      targetPos.set(-0.2, 2.2, 1.5)
    }

    // Smoothly glide the camera to the target position
    state.camera.position.lerp(targetPos, delta * 3.5)
  })
  return null
}

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [activeModal, setActiveModal] = useState(null)
  const [activeBranch, setActiveBranch] = useState('systems')
  const [selectedSkill, setSelectedSkill] = useState(SKILL_TREES.systems.nodes[0])

  const [githubStats, setGithubStats] = useState({ repos: 0, followers: 0, status: 'FETCHING_DATA...' })
// NEW: Fetch live data from GitHub API on load
  useEffect(() => {
    fetch('https://api.github.com/users/NihalBambale11')
      .then(res => res.json())
      .then(data => {
        setGithubStats({ 
          repos: data.public_repos, 
          followers: data.followers, 
          status: 'CONNECTION_STABLE' 
        })
      })
      .catch(() => setGithubStats({ ...githubStats, status: 'UPLINK_FAILED' }))
  }, [])

  // NEW: Secret Konami Code Easter Egg (Matrix Mode)
  useEffect(() => {
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    let keyHistory = []

    const handleKeyDown = (e) => {
      keyHistory.push(e.key)
      keyHistory = keyHistory.slice(-8) // keep only the last 8 keys pressed

      // If the last 8 keys match the Konami Code
      if (JSON.stringify(keyHistory) === JSON.stringify(secretCode)) {
        // Apply a CSS global filter to shift colors to Matrix Green
        document.body.style.filter = 'hue-rotate(90deg) saturate(1.5)'
        alert('[ SYSTEM OVERRIDE ] MATRIX MODE ENGAGED. WELCOME, ADMIN.')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const currentTree = SKILL_TREES[activeBranch]

  // Audio players (the .catch prevents browser auto-play block errors)
  const playHover = () => new Audio('/hover.mp3').play().catch(() => {})
  const playClick = () => new Audio('/click.mp3').play().catch(() => {})

  const handleBranchSwitch = (branchKey) => {
    setActiveBranch(branchKey)
    setSelectedSkill(SKILL_TREES[branchKey].nodes[0])
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', fontFamily: 'monospace' }}>
      
      {/* BOOT OVERLAY RENDERED HERE */}
      <BootSequence />

      <div className="scanlines"></div>

      {/* TOP-LEFT COMPACT PLAYER HUD */}
      <div className="hud-left" style={{
        position: 'absolute', top: '20px', left: '20px', zIndex: 10,
        maxWidth: '360px', padding: '1.2rem 1.4rem',
        background: 'rgba(11, 12, 16, 0.82)', backdropFilter: 'blur(8px)',
        borderLeft: '3px solid #00ffcc', borderTop: '1px solid rgba(0, 255, 204, 0.25)',
        borderRight: '1px solid rgba(0, 255, 204, 0.25)', borderBottom: '1px solid rgba(0, 255, 204, 0.25)',
        borderRadius: '6px', color: 'white', pointerEvents: 'none'
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(0, 255, 204, 0.15)', border: '1px solid #00ffcc', color: '#00ffcc', padding: '2px 8px', fontSize: '0.68rem', marginBottom: '8px' }}>
          SWE 1 @ MIRAFRA • M.TECH @ IIT PATNA
        </div>
        <h1 style={{ margin: 0, color: '#00ffcc', fontSize: '1.9rem', letterSpacing: '1px', textShadow: '0 0 12px rgba(0, 255, 204, 0.35)' }}>
          NIHAL BAMBALE
        </h1>
        <h2 style={{ margin: '4px 0 8px 0', fontSize: '0.88rem', color: '#e0e0e0', fontWeight: 'normal' }}>
          Software Engineer | Multimedia &amp; Embedded Systems
        </h2>
        <p className="bio-text" style={{ margin: 0, lineHeight: '1.45', fontSize: '0.78rem', color: '#aaa' }}>
          Engineering real-time A/V streaming pipelines, V4L2 zero-copy memory architectures, and Qt/QML applications on custom SoC &amp; Linux platforms.
        </p>
      </div>

      {/* RIGHT/BOTTOM SYSTEM TERMINAL & QUICK LINKS */}
      <div className="hud-right" style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 10,
        width: '260px', padding: '1rem',
        background: 'rgba(11, 12, 16, 0.82)', backdropFilter: 'blur(8px)',
        borderRight: '3px solid #ffcc00', borderTop: '1px solid rgba(255, 204, 0, 0.25)',
        borderLeft: '1px solid rgba(255, 204, 0, 0.25)', borderBottom: '1px solid rgba(255, 204, 0, 0.25)',
        borderRadius: '6px', color: 'white', pointerEvents: 'auto'
      }}>
        <div style={{ fontSize: '0.7rem', color: '#ffcc00', marginBottom: '12px', letterSpacing: '1px' }}>
          [ SYSTEM UPLINK : ONLINE ]
        </div>

        {/* MOBILE NAVIGATION MENU (Hidden on large screens) */}
    <div className="mobile-nav-menu">
          <button className="mobile-nav-btn" 
                  onMouseEnter={playHover} 
                  onClick={() => { playClick(); setActiveModal('projects') }} 
                  style={{ border: '1px solid #00ffcc', color: '#00ffcc' }}>
            [ VIEW PROJECTS ]
          </button>
          <button className="mobile-nav-btn" 
                  onMouseEnter={playHover} 
                  onClick={() => { playClick(); setActiveModal('skills') }} 
                  style={{ border: '1px solid #ff3366', color: '#ff3366' }}>
            [ SKILL TREE ]
          </button>
          <button className="mobile-nav-btn" 
                  onMouseEnter={playHover} 
                  onClick={() => { playClick(); setActiveModal('dossier') }} 
                  style={{ border: '1px solid #ffcc00', color: '#ffcc00' }}>
            [ QUEST LOG ]
          </button>
        </div>
        
        <div className="quick-links-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="https://github.com/NihalBambale11" target="_blank" rel="noreferrer" className="quick-link" style={{ color: '#fff' }}>
            &gt; GITHUB_ARCHIVE
          </a>
          <a href="https://linkedin.com/in/YOUR_LINKEDIN" target="_blank" rel="noreferrer" className="quick-link" style={{ color: '#00ccff' }}>
            &gt; LINKEDIN_NETWORK
          </a>
          <a href="/Nihal_Bambale.pdf" download="Nihal_Bambale_Resume.pdf" className="quick-link" style={{ color: '#ff3366' }}>
            &gt; DOWNLOAD_RESUME.exe
          </a>
        </div>

<div className="boot-text" style={{ marginTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', fontSize: '0.65rem', color: '#555', lineHeight: '1.6' }}>
          &gt; GITHUB_API_UPLINK: <span style={{ color: githubStats.status === 'CONNECTION_STABLE' ? '#00ffcc' : '#ffcc00' }}>[{githubStats.status}]</span><br/>
          &gt; PUBLIC_ARCHIVES: <span style={{ color: '#fff' }}>{githubStats.repos} REPOSITORIES</span><br/>
          &gt; NETWORK_NODES: <span style={{ color: '#fff' }}>{githubStats.followers} CONNECTIONS</span><br/>
          &gt; AWAITING_COMMAND...
        </div>
      </div>

      {/* MODALS */}
      {activeModal === 'projects' && (
        <div className="modal-container" style={modalContainerStyle('#00ffcc')}>
          <div style={modalHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, color: '#00ffcc', letterSpacing: '2px', fontSize: '1.4rem' }}>// DEPLOYED SYSTEMS &amp; PROJECTS</h2>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>PRODUCTION EMBEDDED PIPELINES &amp; FULL-STACK BUILDS</span>
            </div>
            <button onClick={() => setActiveModal(null)} style={closeButtonStyle}>[ ESC / CLOSE ]</button>
          </div>

          <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginTop: '1.5rem' }}>
            {PROJECTS.map((proj) => (
              <div key={proj.id} className="project-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 255, 204, 0.25)', borderRadius: '6px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: '#00ffcc', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{proj.category}</span>
                  <h3 style={{ margin: '0.4rem 0 0.6rem 0', color: '#fff', fontSize: '1.1rem' }}>{proj.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#bbb', lineHeight: '1.5' }}>{proj.description}</p>
                  <p style={{ fontSize: '0.75rem', color: '#00ffcc', background: 'rgba(0, 255, 204, 0.06)', padding: '6px', borderRadius: '4px' }}>
                    ⚡ {proj.metrics}
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '0.8rem' }}>
                  {proj.tech.map((t, idx) => (
                    <span key={idx} style={{ background: 'rgba(0, 255, 204, 0.1)', border: '1px solid rgba(0, 255, 204, 0.3)', color: '#00ffcc', fontSize: '0.68rem', padding: '2px 6px', borderRadius: '3px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeModal === 'skills' && (
        <div className="modal-container" style={modalContainerStyle(currentTree.color)}>
          <div style={modalHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, color: currentTree.color, letterSpacing: '2px', fontSize: '1.4rem' }}>
                // SKILL TREE &amp; TECH LOADOUT
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                HACKERRANK STATS: C++ (5★ GOLD) | JAVA (4★) | SQL (4★)
              </span>
            </div>
            <button onClick={() => setActiveModal(null)} style={closeButtonStyle}>[ ESC / CLOSE ]</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1.2rem', flexWrap: 'wrap' }}>
            {Object.entries(SKILL_TREES).map(([key, branch]) => (
              <button
                key={key}
                onClick={() => handleBranchSwitch(key)}
                style={{
                  flex: 1, minWidth: '170px', padding: '10px',
                  background: activeBranch === key ? `${branch.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeBranch === key ? branch.color : '#333'}`,
                  color: activeBranch === key ? branch.color : '#888',
                  borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace',
                  fontWeight: 'bold', fontSize: '0.78rem', textAlign: 'left'
                }}
              >
                ◆ {branch.name.split('//')[0]}
                <div style={{ fontSize: '0.68rem', color: '#ccc', marginTop: '3px', fontWeight: 'normal' }}>
                  {branch.name.split('//')[1]}
                </div>
              </button>
            ))}
          </div>

          <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentTree.nodes.map((node, i) => {
                const isSelected = selectedSkill.id === node.id
                return (
                  <div
                    key={node.id}
                    className="skill-node"
                    onClick={() => setSelectedSkill(node)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', cursor: 'pointer', borderRadius: '6px',
                      background: isSelected ? `${currentTree.color}25` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? currentTree.color : 'rgba(255,255,255,0.12)'}`,
                      boxShadow: isSelected ? `0 0 15px ${currentTree.color}40` : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${currentTree.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: currentTree.color, fontWeight: 'bold' }}>
                        0{i + 1}
                      </span>
                      <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{node.name}</span>
                    </div>
                    <span style={{ color: currentTree.color, fontSize: '0.8rem', border: `1px solid ${currentTree.color}`, padding: '2px 8px', borderRadius: '4px' }}>LVL {node.rank}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.5)', border: `1px solid ${currentTree.color}`, borderRadius: '8px', padding: '1.5rem', boxShadow: `inset 0 0 25px ${currentTree.color}20` }}>
              <div style={{ fontSize: '0.72rem', color: currentTree.color, letterSpacing: '1px', textTransform: 'uppercase' }}>[ SKILL INSPECTOR ]</div>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem', color: '#fff' }}>{selectedSkill.name}</h3>
              <div style={{ fontSize: '0.8rem', color: currentTree.color, marginBottom: '1rem' }}>Mastery Rank: {selectedSkill.rank}</div>
              <p style={{ fontSize: '0.88rem', color: '#ccc', lineHeight: '1.6', borderTop: '1px solid #333', paddingTop: '1rem' }}>{selectedSkill.desc}</p>
              <div style={{ marginTop: '1.2rem', padding: '10px', background: `${currentTree.color}15`, borderLeft: `3px solid ${currentTree.color}`, fontSize: '0.78rem', color: '#ddd' }}>
                <strong>PASSIVE LOADOUT BONUS:</strong><br />{currentTree.loadoutBonus}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'dossier' && (
        <div className="modal-container" style={modalContainerStyle('#ffcc00')}>
          <div style={modalHeaderStyle}>
            <div>
              <h2 style={{ margin: 0, color: '#ffcc00', letterSpacing: '2px', fontSize: '1.4rem' }}>// QUEST LOG &amp; COMMS TERMINAL</h2>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>CAREER TIMELINE, EDUCATION &amp; VISITOR TRANSMISSION</span>
            </div>
            <button onClick={() => setActiveModal(null)} style={closeButtonStyle}>[ ESC / CLOSE ]</button>
          </div>

          <div className="dossier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
            
            <div>
              <h3 style={{ color: '#ffcc00', borderBottom: '1px solid #333', paddingBottom: '6px' }}>◆ ACTIVE QUEST (EXPERIENCE)</h3>
              <h4 style={{ margin: '0.5rem 0 0.2rem 0', color: '#fff' }}>Software Engineer 1 | Mirafra Technologies</h4>
              <span style={{ fontSize: '0.75rem', color: '#00ffcc' }}>September 2024 – Present | Hyderabad, India</span>
              <ul style={{ fontSize: '0.82rem', color: '#bbb', lineHeight: '1.6', paddingLeft: '1.2rem', marginTop: '0.6rem' }}>
                <li>Engineered real-time multimedia streaming apps using Live555, RTP/UDP, TurboJPEG &amp; Opus.</li>
                <li>Implemented V4L2 zero-copy capture pipelines via custom IOCTLs to minimize latency.</li>
                <li>Built cross-platform C++ &amp; Qt/QML streaming clients with ALSA audio integration.</li>
              </ul>

              <h3 style={{ color: '#ffcc00', borderBottom: '1px solid #333', paddingBottom: '6px', marginTop: '1.5rem' }}>◆ ACADEMIA</h3>
              <div style={{ marginBottom: '0.8rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.88rem' }}>M.Tech in AI &amp; Data Science</strong>
                <div style={{ fontSize: '0.75rem', color: '#00ffcc' }}>IIT Patna | 2026 – Present</div>
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                <strong style={{ color: '#fff', fontSize: '0.88rem' }}>PG-DAC (Advanced Computing)</strong>
                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>CDAC Pune | 2024</div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 204, 0, 0.3)', borderRadius: '8px', padding: '1.4rem' }}>
              <h3 style={{ color: '#ffcc00', margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>◆ TRANSMIT COMMS TO NIHAL</h3>
              <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '1.2rem' }}>
                Drop your details and message. This will instantly notify my inbox so I know you visited!
              </p>

              <form action="https://formspree.io/f/YOUR_ENDPOINT_HERE" method="POST">
                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#ffcc00', marginBottom: '4px' }}>YOUR NAME / CALLSIGN</label>
                  <input type="text" name="name" required placeholder="e.g. Alex (Recruiter)" style={inputStyle} />
                </div>

                <div style={{ marginBottom: '0.9rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#ffcc00', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                  <input type="email" name="email" required placeholder="alex@company.com" style={inputStyle} />
                </div>

                <div style={{ marginBottom: '1.1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#ffcc00', marginBottom: '4px' }}>TRANSMISSION MESSAGE</label>
                  <textarea name="message" rows="3" required placeholder="Let's talk about an embedded C++ or Web3D role..." style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" style={{ width: '100%', background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', color: '#ffcc00', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  [ TRANSMIT MESSAGE ➔ ]
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#888' }}>
                  Direct: <a href="mailto:nihalbambale2000@gmail.com" style={{ color: '#00ffcc', textDecoration: 'none' }}>nihalbambale2000@gmail.com</a>
                </div>
                
                <a 
                  href="/Nihal_Bambale.pdf" 
                  download="Nihal_Bambale_Resume.pdf"
                  style={{ display: 'inline-block', background: 'transparent', border: '1px solid #00ffcc', color: '#00ffcc', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  [ DOWNLOAD RESUME PDF ]
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D CANVAS BACKGROUND */}
      <Canvas camera={{ position: [-0.4, 1.4, 4.2], fov: 58 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <Sparkles count={350} scale={12} size={1.2} speed={0.4} opacity={0.25} color="#00ffcc" />
        <Sparkles count={80} scale={10} size={2} speed={0.2} opacity={0.15} color="#ff3366" />
        
        <group position={[0.55, -1, 0]} rotation={[0, -0.4, 0]}>
          <Suspense fallback={null}>
            <CameraController activeModal={activeModal} />
            <Model scale={0.9} />

            {!activeModal && (
              <>
<Html position={[-1.4, 2.3, 0.1]} center distanceFactor={5}>
                  <div className="tag-3d desktop-3d-tag" 
                       onPointerEnter={playHover} 
                       onClick={() => { playClick(); setActiveModal('projects') }} 
                       style={tag3DStyle('#00ffcc')}>
                    [ VIEW PROJECTS ]
                  </div>
                </Html>

                <Html position={[0.45, 2.3, -0.1]} center distanceFactor={5}>
                  <div className="tag-3d desktop-3d-tag" 
                       onPointerEnter={playHover} 
                       onClick={() => { playClick(); setActiveModal('skills') }} 
                       style={tag3DStyle('#ff3366')}>
                    [ SKILL TREE ]
                  </div>
                </Html>

                <Html position={[-0.6, 1.15, 0.7]} center distanceFactor={5}>
                  <div className="tag-3d desktop-3d-tag" 
                       onPointerEnter={playHover} 
                       onClick={() => { playClick(); setActiveModal('dossier') }} 
                       style={tag3DStyle('#ffcc00')}>
                    [ QUEST LOG &amp; CONTACT ]
                  </div>
                </Html>
              </>
            )}
          </Suspense>
        </group>

        <OrbitControls 
          enableZoom={!activeModal} 
          enablePan={!activeModal} 
          enableRotate={!activeModal} 
        />
      </Canvas>
    </div>
  )
}

// ==========================================
// 4. REUSABLE STYLES
// ==========================================
const tag3DStyle = (color) => ({
  background: 'rgba(11, 12, 16, 0.92)',
  border: `1px solid ${color}`,
  color: color,
  padding: '6px 14px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  boxShadow: `0 0 14px ${color}55`
})

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 204, 0, 0.4)',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: 'monospace',
  fontSize: '0.82rem',
  outline: 'none',
  boxSizing: 'border-box'
}

const modalContainerStyle = (borderColor) => ({
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '88%', maxWidth: '940px', maxHeight: '80vh',
  background: 'rgba(11, 12, 16, 0.96)', backdropFilter: 'blur(12px)',
  border: `1px solid ${borderColor}`, borderRadius: '10px', zIndex: 50,
  color: '#e0e0e0', padding: '2rem', overflowY: 'auto', boxShadow: `0 0 40px ${borderColor}33`
})

const modalHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '1rem'
}

const closeButtonStyle = {
  background: 'transparent', color: '#ff3366', border: '1px solid #ff3366',
  borderRadius: '4px', padding: '5px 12px', fontSize: '0.85rem',
  fontFamily: 'monospace', cursor: 'pointer'
}