// // src/pages/Login.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import './Login.css';

// export default function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError]       = useState('');
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/api/users/login`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ username, password }),
//         }
//       );
//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || 'Invalid credentials. Please try again.');
//         return;
//       }

//       // backend returns { token, user: { ... } }
//       const { token, user: userPayload } = data;
//       login({ token, ...userPayload });
//       navigate('/dashboard');
//     } catch (err) {
//       console.error('Login error:', err);
//       setError('An unexpected error occurred. Please try again.');
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-overlay" />
//       <div className="login-card">
//         <h1 className="login-title">Rutgers CSO Login</h1>
//         <p className="login-subtitle">Community Service Officer Portal</p>

//         {error && <p className="error-message">{error}</p>}

//         <form onSubmit={handleLogin}>
//           <input
//             type="text"
//             placeholder="Username"
//             className="login-input"
//             value={username}
//             onChange={e => setUsername(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="login-input"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//           />

//           <button type="submit" className="login-button">
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

// // src/pages/Login.js
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import * as THREE from 'three';
// import './Login.css';

// export default function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError]       = useState('');
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const mountRef = useRef(null); // Ref for the three.js container

//   // useEffect for three.js background animation
//   useEffect(() => {
//     if (!mountRef.current) return;

//     const currentMount = mountRef.current;
//     let scene, camera, renderer, particles, particleMaterial;

//     // Scene setup
//     scene = new THREE.Scene();

//     // Camera setup
//     camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
//     camera.position.z = 300; // Adjusted for particle visibility

//     // Renderer setup
//     renderer = new THREE.WebGLRenderer({ alpha: true }); // alpha: true for transparent background if needed
//     renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     currentMount.appendChild(renderer.domElement);

//     // Particle setup
//     const particleCount = 5000;
//     const particleGeometry = new THREE.BufferGeometry();
//     const positions = new Float32Array(particleCount * 3);

//     for (let i = 0; i < particleCount * 3; i++) {
//       positions[i] = (Math.random() - 0.5) * 1000; // Spread particles
//     }
//     particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

//     particleMaterial = new THREE.PointsMaterial({
//       color: 0xffffff, // White particles
//       size: 1.5,
//       transparent: true,
//       opacity: 0.7,
//       blending: THREE.AdditiveBlending // For a brighter effect
//     });

//     particles = new THREE.Points(particleGeometry, particleMaterial);
//     scene.add(particles);

//     // Animation loop
//     let mouseX = 0;
//     let mouseY = 0;
//     const windowHalfX = window.innerWidth / 2;
//     const windowHalfY = window.innerHeight / 2;

//     const onDocumentMouseMove = (event) => {
//       mouseX = (event.clientX - windowHalfX) / 2;
//       mouseY = (event.clientY - windowHalfY) / 2;
//     };
//     document.addEventListener('mousemove', onDocumentMouseMove);


//     const animate = () => {
//       requestAnimationFrame(animate);

//       const time = Date.now() * 0.00005;
//       particles.rotation.x = time * 0.25;
//       particles.rotation.y = time * 0.5;

//       // Make particles react to mouse movement
//       camera.position.x += (mouseX - camera.position.x) * 0.005;
//       camera.position.y += (-mouseY - camera.position.y) * 0.005;
//       camera.lookAt(scene.position);


//       renderer.render(scene, camera);
//     };
//     animate();

//     // Handle window resize
//     const handleResize = () => {
//       if (currentMount) {
//         camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
//       }
//     };
//     window.addEventListener('resize', handleResize);

//     // Cleanup on component unmount
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       document.removeEventListener('mousemove', onDocumentMouseMove);
//       if (currentMount && renderer.domElement) {
//         currentMount.removeChild(renderer.domElement);
//       }
//       // Dispose Three.js objects
//       particleGeometry.dispose();
//       particleMaterial.dispose();
//       renderer.dispose();
//     };
//   }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/api/users/login`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ username, password }),
//         }
//       );
//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.error || 'Invalid credentials. Please try again.');
//         return;
//       }

//       const { token, user: userPayload } = data;
//       login({ token, ...userPayload }); // This comes from useAuth()
//       navigate('/dashboard');
//     } catch (err) {
//       console.error('Login error:', err);
//       setError('An unexpected error occurred. Please try again.');
//     }
//   };

//   return (
//     <div className="login-page">
//       {/* Container for three.js canvas */}
//       <div ref={mountRef} className="login-background-canvas"></div>
//       <div className="login-overlay" /> {/* Keep overlay for readability */}
//       <div className="login-card">
//         <h1 className="login-title">Rutgers CSO Login</h1>
//         <p className="login-subtitle">Community Service Officer Portal</p>

//         {error && <p className="error-message">{error}</p>}

//         <form onSubmit={handleLogin}>
//           <div className="input-wrapper">
//             <input
//               type="text"
//               placeholder="Username"
//               className="login-input"
//               value={username}
//               onChange={e => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div className="input-wrapper">
//             <input
//               type="password"
//               placeholder="Password"
//               className="login-input"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="login-button">
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as THREE from 'three';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const mountRef = useRef(null);

  // three.js starfield
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth/mount.clientHeight, 0.1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const count = 6000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < pos.length; i++) {
      pos[i] = (Math.random()-0.5)*1000;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.5
    });
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);

    let mx = 0, my = 0;
    const onMouse = e => {
      mx = (e.clientX - window.innerWidth/2)/4;
      my = (e.clientY - window.innerHeight/2)/4;
    };
    document.addEventListener('mousemove', onMouse);

    const animate = () => {
      requestAnimationFrame(animate);
      const t = Date.now()*0.00003;
      stars.rotation.x = t*0.3;
      stars.rotation.y = t*0.6;
      camera.position.x += (mx - camera.position.x)*0.004;
      camera.position.y += (-my - camera.position.y)*0.004;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = mount.clientWidth/mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', onMouse);
      mount.removeChild(renderer.domElement);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL||'http://localhost:5001'}/api/users/login`,
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ username, password })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error||'Invalid credentials.');
        return;
      }
      const { token, user: userPayload } = data;
      login({ token, ...userPayload });
      navigate('/dashboard');
    } catch {
      setError('Unexpected error. Try again.');
    }
  };

  return (
    <div className="login-page">
      <div ref={mountRef} className="login-background-canvas" />
      <div className="login-overlay" />

      <div className="login-card">
        <h1>Rutgers CSO Login</h1>
        <p className="subtitle">Community Service Officer Portal</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e=>setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
