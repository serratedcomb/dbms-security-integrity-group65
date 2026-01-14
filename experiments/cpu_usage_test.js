// experiments/throughput_test.js
const { MongoClient } = require("mongodb");
const { encrypt } = require("../encryption/field_encryption");
const { generateChecksum } = require("../mongodb/checksum_trigger");
const fs = require("fs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "dbms_security";

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const col = db.collection("secure_data");
  await col.deleteMany({});

  const N = 500;
  const rows = [];
  rows.push("method,ops_per_sec");

  async function measure(methodName, makeDoc) {
    await col.deleteMany({});
    const start = Date.now();
    for (let i = 0; i < N; i++) {
      await col.insertOne(makeDoc(i));
    }
    const end = Date.now();
    const seconds = (end - start) / 1000;
    const ops = N / seconds;
    rows.push(`${methodName},${ops.toFixed(2)}`);
  }

  await measure("MethodA", (i) => {
    const data = `data_${i}`;
    return { record_id: i, encrypted_field: data, checksum: generateChecksum(data) };
  });

  await measure("MethodB", (i) => {
    const enc = encrypt(`data_${i}`);
    return { record_id: i, encrypted_field: enc, checksum: "NA" };
  });

  await measure("MethodC", (i) => {
    const enc = encrypt(`data_${i}`);
    return { record_id: i, encrypted_field: enc, checksum: generateChecksum(enc) };
  });

  fs.writeFileSync("results/cpu_results.csv", rows.join("\n"));
  console.log("Saved results/cpu_results.csv");

  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
