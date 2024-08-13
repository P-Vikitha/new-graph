import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function GraphPage() {
  const svgRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    // Fetch data from the API route
    fetch('/api/graphParts')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error('Error fetching graph data:', error));
  }, []);

  useEffect(() => {
    if (data.nodes.length === 0) return; // Wait until data is loaded

    const svg = d3
      .select(svgRef.current)
      .attr('width', 800)
      .attr('height', 600);

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        'link',
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance((d) => d.distance)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(400, 300));

    const link = svg
      .append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', (d) => d.color);

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.size / 2)
      .attr('fill', (d) => d.color)
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [data]);

  return <svg ref={svgRef}></svg>;
}
