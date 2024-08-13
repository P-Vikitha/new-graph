const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI, // or 'neo4j://localhost' for newer versions
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const session = driver.session();

try {
  const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m');

  const nodes = new Map();
  const links = [];

  result.records.forEach((record) => {
    const sourceNode = record.get('n').properties;
    const targetNode = record.get('m').properties;
    const relationship = record.get('r').type;

    if (!nodes.has(sourceNode.name)) {
      nodes.set(sourceNode.name, {
        id: sourceNode.name,
        size: sourceNode.size,
        color: sourceNode.color,
        showChildren: sourceNode.showChildren,
      });
    }
    if (!nodes.has(targetNode.name)) {
      nodes.set(targetNode.name, {
        id: targetNode.name,
        size: targetNode.size,
        color: targetNode.color,
        showChildren: targetNode.showChildren,
      });
    }

    links.push({
      source: sourceNode.name,
      target: targetNode.name,
      relationship: relationship,
      color: '#BE6B78',
      distance: 90,
    });
  });

  // Convert Map to array
  const responseData = { nodes: Array.from(nodes.values()), links };

  res.status(200).json(responseData);
} catch (error) {
  console.error('Error fetching data:', error);
  res.status(500).json({ error: 'Failed to fetch data from Neo4j' });
} finally {
  await session.close();
  await driver.close();
}
