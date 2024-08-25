import neo4j from 'neo4j-driver';

let driver;

const defaultOptions = {
  uri: process.env.NEO4J_URI,
  username: process.env.NEO4J_USER,
  password: process.env.NEO4J_PASSWORD,
};

export default async function getDriver() {
  const { uri, username, password } = defaultOptions;

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    const serverInfo = await driver.getServerInfo();
    console.log('Connection established');
    console.log(serverInfo);
  } catch (err) {
    console.error(`Connection error\n${err}\nCause: ${err.cause}`);
  }

  return driver;
}
