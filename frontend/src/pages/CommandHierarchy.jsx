// import React, { useEffect, useState } from 'react';
// import { getHierarchy } from '../api';
// import './CommandHierarchy.css';

// export default function CommandHierarchy() {
//   const [root, setRoot] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     getHierarchy()
//       .then(data => setRoot(data[0]))   // assume single BS root
//       .catch(() => setError('Failed to load hierarchy'));
//   }, []);

//   if (error)  return <p className="error">{error}</p>;
//   if (!root) return <p className="loading">Loading…</p>;

//   return (
//     <div className="hierarchy-page">
//       <h2>Command Hierarchy</h2>
//       <div className="tree-container">
//         <Node node={root} level={0} />
//       </div>
//     </div>
//   );
// }

// function Node({ node, level }) {
//   const kids = node.reports || [];
//   const isLeafLevel = level === 3; // level 0=BS,1=CS,2=XO,3=FTO → children are CSO/CDT

//   return (
//     <div className={`node-block level-${level}`}>
//       <div className="node-box">
//         {node.username} ({node.user_rank})
//       </div>

//       {kids.length > 0 && (
//         <div className={isLeafLevel ? 'leaf-container' : 'children-container'}>
//           {kids.map(c => (
//             <Node key={c.id} node={c} level={level + 1} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
//-------------------------------------------------------------------
// import React, { useEffect, useState, useRef } from 'react';
// import { getHierarchy } from '../api';
// import './CommandHierarchy.css';

// export default function CommandHierarchy() {
//   const [root, setRoot] = useState(null);
//   const [error, setError] = useState('');
//   const containerRef = useRef(null);

//   // 1) Load data
//   useEffect(() => {
//     getHierarchy()
//       .then(data => setRoot(data[0]))   // assume single BS root
//       .catch(() => setError('Failed to load hierarchy'));
//   }, []);

//   // 2) Once loaded, pad & center
//   useEffect(() => {
//     if (!root || !containerRef.current) return;
//     const c = containerRef.current;
//     const content = c.querySelector('.tree-content');
//     if (!content) return;

//     const cw = c.clientWidth;
//     const sw = content.offsetWidth;

//     // equal blank if content narrower; zero otherwise
//     const pad = Math.max(0, (cw - sw) / 2);
//     c.style.paddingLeft  = `${pad}px`;
//     c.style.paddingRight = `${pad}px`;

//     // center overflow if content wider
//     const scrollPos = Math.max(0, (sw - cw) / 2);
//     c.scrollLeft = scrollPos;
//   }, [root]);

//   if (error)  return <p className="error">{error}</p>;
//   if (!root) return <p className="loading">Loading…</p>;

//   return (
//     <div className="hierarchy-page">
//       <h2>Command Hierarchy</h2>
//       <div className="tree-frame">
//         <div ref={containerRef} className="tree-container">
//           {/* NEW wrapper: measure its width */}
//           <div className="tree-content">
//             <Node node={root} level={0} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Node({ node, level }) {
//   const kids = node.reports || [];
//   const isLeafLevel = level === 3;

//   return (
//     <div className={`node-block level-${level}`}>
//       <div className="node-box">
//         {node.username} ({node.user_rank})
//       </div>
//       {kids.length > 0 && (
//         <div className={isLeafLevel ? 'leaf-container' : 'children-container'}>
//           {kids.map(c => (
//             <Node key={c.id} node={c} level={level + 1} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
//--------------------------------------------------------------------
import React, { useEffect, useState, useRef } from 'react';
import { getHierarchy } from '../api';
import './CommandHierarchy.css';

export default function CommandHierarchy() {
  const [root, setRoot]   = useState(null);
  const [error, setError] = useState('');
  const containerRef      = useRef(null);

  useEffect(() => {
    // initial fetch
    getHierarchy()
      .then(data => setRoot(data[0]))   // assume single BS root
      .catch(() => setError('Failed to load hierarchy'));

    // re-fetch whenever admin-users page dispatches this event
    const handler = () => {
      getHierarchy()
        .then(data => setRoot(data[0]))
        .catch(() => setError('Failed to reload hierarchy'));
    };
    window.addEventListener('hierarchyUpdated', handler);
    return () => window.removeEventListener('hierarchyUpdated', handler);
  }, []);

  // center logic unchanged…
  useEffect(() => {
    if (!root || !containerRef.current) return;
    const c = containerRef.current;
    const content = c.querySelector('.tree-content');
    if (!content) return;
    const cw = c.clientWidth, sw = content.offsetWidth;
    const pad = Math.max(0, (cw - sw) / 2);
    c.style.paddingLeft  = `${pad}px`;
    c.style.paddingRight = `${pad}px`;
    c.scrollLeft = Math.max(0, (sw - cw) / 2);
  }, [root]);

  if (error)  return <p className="error">{error}</p>;
  if (!root) return <p className="loading">Loading…</p>;

  return (
    <div className="hierarchy-page">
      <h2>Command Hierarchy</h2>
      <div className="tree-frame">
        <div ref={containerRef} className="tree-container">
          <div className="tree-content">
            <Node node={root} level={0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Node({ node, level }) {
  const kids = node.reports || [];
  const isLeafLevel = level === 3;
  return (
    <div className={`node-block level-${level}`}>
      <div className="node-box">
        {node.username} ({node.user_rank})
      </div>
      {kids.length > 0 && (
        <div className={isLeafLevel ? 'leaf-container' : 'children-container'}>
          {kids.map(c => <Node key={c.id} node={c} level={level + 1} />)}
        </div>
      )}
    </div>
  );
}
