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
//   const mountRef = useRef(null);

//   // three.js starfield
//   useEffect(() => {
//     if (!mountRef.current) return;
//     const mount = mountRef.current;
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(75, mount.clientWidth/mount.clientHeight, 0.1, 1000);
//     camera.position.z = 300;

//     const renderer = new THREE.WebGLRenderer({ alpha: true });
//     renderer.setSize(mount.clientWidth, mount.clientHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     mount.appendChild(renderer.domElement);

//     const count = 6000;
//     const geo = new THREE.BufferGeometry();
//     const pos = new Float32Array(count * 3);
//     for (let i = 0; i < pos.length; i++) {
//       pos[i] = (Math.random()-0.5)*1000;
//     }
//     geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

//     const mat = new THREE.PointsMaterial({
//       color: 0xffffff,
//       size: 1,
//       transparent: true,
//       opacity: 0.5
//     });
//     const stars = new THREE.Points(geo, mat);
//     scene.add(stars);

//     let mx = 0, my = 0;
//     const onMouse = e => {
//       mx = (e.clientX - window.innerWidth/2)/4;
//       my = (e.clientY - window.innerHeight/2)/4;
//     };
//     document.addEventListener('mousemove', onMouse);

//     const animate = () => {
//       requestAnimationFrame(animate);
//       const t = Date.now()*0.00003;
//       stars.rotation.x = t*0.3;
//       stars.rotation.y = t*0.6;
//       camera.position.x += (mx - camera.position.x)*0.004;
//       camera.position.y += (-my - camera.position.y)*0.004;
//       camera.lookAt(scene.position);
//       renderer.render(scene, camera);
//     };
//     animate();

//     const onResize = () => {
//       camera.aspect = mount.clientWidth/mount.clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(mount.clientWidth, mount.clientHeight);
//     };
//     window.addEventListener('resize', onResize);

//     return () => {
//       window.removeEventListener('resize', onResize);
//       document.removeEventListener('mousemove', onMouse);
//       mount.removeChild(renderer.domElement);
//       geo.dispose();
//       mat.dispose();
//       renderer.dispose();
//     };
//   }, []);

//   const handleLogin = async e => {
//     e.preventDefault();
//     setError('');
//     try {
//       const res = await fetch(
//         `${process.env.REACT_APP_API_BASE_URL||'http://localhost:5001'}/api/users/login`,
//         {
//           method:'POST',
//           headers:{'Content-Type':'application/json'},
//           body:JSON.stringify({ username, password })
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error||'Invalid credentials.');
//         return;
//       }
//       const { token, user: userPayload } = data;
//       login({ token, ...userPayload });
//       navigate('/dashboard');
//     } catch {
//       setError('Unexpected error. Try again.');
//     }
//   };

//   return (
//     <div className="login-page">
//       <div ref={mountRef} className="login-background-canvas" />
//       <div className="login-overlay" />

//       <div className="login-card">
//         <h1>Rutgers CSO Login</h1>
//         <p className="subtitle">Community Service Officer Portal</p>

//         {error && <div className="error">{error}</div>}

//         <form onSubmit={handleLogin}>
//           <input
//             type="text"
//             placeholder="Username"
//             value={username}
//             onChange={e=>setUsername(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={e=>setPassword(e.target.value)}
//             required
//           />
//           <button type="submit">Login</button>
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
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const mountRef = useRef(null);

  // three.js starfield (no changes needed in this part)
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
        {/* UPDATED: Added a logo */}
        <div className="logo-container">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* UPDATED: Generic Branding */}
        <h1>Welcome to Shiftelix</h1>
        <p className="subtitle">Schedule. Collaborate. Excel.</p>

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
