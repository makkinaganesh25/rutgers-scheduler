// src/components/TreeChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import Tree from 'react-d3-tree';

// colors per level 0–4
const LEVEL_COLORS = ['#4CAF50','#2196F3','#FF9800','#FFC107','#9C27B0'];

export default function TreeChart({ data }) {
  const container = useRef();
  const [size, setSize] = useState({ w:0,h:0 });

  useEffect(() => {
    const { offsetWidth:w, offsetHeight:h } = container.current;
    setSize({ w, h });
  }, []);

  // center root at top
  const translate = { x: size.w/2, y: 50 };

  return (
    <div ref={container} style={{ width:'100%', height:'100%' }}>
      {size.w>0 && (
        <Tree
          data={data}
          orientation="vertical"
          translate={translate}
          pathFunc="step"
          collapsible={false}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          renderCustomNodeElement={props => {
            const { nodeDatum } = props;
            const color = LEVEL_COLORS[nodeDatum.level] || LEVEL_COLORS.slice(-1)[0];
            return (
              <g>
                <rect
                  x={-70} y={-20} width={140} height={40}
                  fill={color} stroke="#333"
                />
                <text
                  fill="#fff" x={0} y={0} textAnchor="middle"
                  style={{ fontSize:'0.85rem', pointerEvents:'none' }}
                >
                  {nodeDatum.name}
                </text>
              </g>
            );
          }}
        />
      )}
    </div>
  );
}
