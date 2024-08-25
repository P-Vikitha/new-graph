import getDriver from '../../../../utils/neo4j';

export async function GET(req, res) {
  const driver = await getDriver();
  const session = driver.session();

  try {
    const locationsTxResultPromise = session.readTransaction(
      async (transaction) => {
        const cypher = `
        MATCH (location:MainLocation)
        OPTIONAL MATCH (location)-[r:cliftonPART|defencePART|saddarPART|boatPART]->(subLocation)
        RETURN location, r, subLocation
      `;

        const locationsTxResponse = await transaction.run(cypher);

        const nodes = [];
        const links = [];

        locationsTxResponse.records.forEach((record) => {
          const location = record.get('location').properties;
          const subLocation = record.get('subLocation')
            ? record.get('subLocation').properties
            : null;
          const relationship = record.get('r');

          if (!nodes.some((node) => node.id === location.name)) {
            nodes.push({ id: location.name, group: 1 });
          }

          if (subLocation) {
            if (!nodes.some((node) => node.id === subLocation.name)) {
              nodes.push({ id: subLocation.name, group: 2 });
            }

            if (relationship) {
              links.push({
                source: location.name,
                target: subLocation.name,
                value: 1,
              });
            }
          }
        });

        return { nodes, links };
      }
    );

    const graphData = await locationsTxResultPromise;
    return new Response(JSON.stringify({ success: true, ...graphData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } finally {
    await session.close();
  }
}

export const runtime = 'edge';
