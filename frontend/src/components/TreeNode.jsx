import React, { useState } from 'react';
import './TreeNode.css';

export default function TreeNode({ node, selectedId, onSelect, root = false }) {
  const [open, setOpen] = useState(root);
  const hasChildren = Array.isArray(node.reports) && node.reports.length > 0;
  const isSelected = node.id === selectedId;

  const handleToggle = e => {
    e.stopPropagation();
    setOpen(o => !o);
  };

  return (
    <div className={`tree-node${root ? ' root-node' : ''}`}>
      <div
        className={`tree-node-label${isSelected ? ' selected' : ''}`}
        onClick={() => onSelect(node)}
      >
        {hasChildren
          ? <span className="tree-node-toggle" onClick={handleToggle}>
              {open ? '▾' : '▸'}
            </span>
          : <span className="tree-node-bullet">•</span>
        }
        <span className="tree-node-text">
          {/* <-- SWITCHED TO node.username */}
          {node.username}
          <span className="tree-node-rank"> ({node.user_rank})</span>
        </span>
      </div>

      {hasChildren && open && (
        <div className="tree-node-children">
          {node.reports.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// // src/components/TreeNode.jsx
// import React, { useState } from 'react';
// import './TreeNode.css';

// export default function TreeNode({
//   node,
//   onSelect,
//   root = false,
//   onAdd,      // new
//   onEdit,     // new
//   onDelete    // new
// }) {
//   const [open, setOpen] = useState(root);

//   const handleClick = () => {
//     setOpen(o => !o);
//     onSelect(node);
//   };

//   return (
//     <div className="tree-node">
//       <div className={`node-label ${open?'open':''}`} onClick={handleClick}>
//         {node.reports?.length > 0 && (
//           <span className="toggle">{open? '▾':'▸'}</span>
//         )}
//         <span className="node-text">
//           {node.first_name || node.username} <small>({node.user_rank})</small>
//         </span>
//         {(onAdd || onEdit || onDelete) && (
//           <span className="node-actions">
//             {onAdd   && <button onClick={e=>{e.stopPropagation(); onAdd(node);}}>＋</button>}
//             {onEdit  && <button onClick={e=>{e.stopPropagation(); onEdit(node);}}>✎</button>}
//             {onDelete&& <button onClick={e=>{e.stopPropagation(); onDelete(node);}}>🗑️</button>}
//           </span>
//         )}
//       </div>
//       {open && node.reports?.length > 0 && (
//         <div className="node-children">
//           {node.reports.map(child => (
//             <TreeNode
//               key={child.id}
//               node={child}
//               onSelect={onSelect}
//               onAdd={onAdd}
//               onEdit={onEdit}
//               onDelete={onDelete}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
