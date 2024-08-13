'use client';

import GraphPage from '../../../pages/graph'; // Assuming loadGraph.js contains the GraphPage component

export default function loadGraph() {
  return (
    <div className='container'>
      <GraphPage />
    </div>
  );
}
