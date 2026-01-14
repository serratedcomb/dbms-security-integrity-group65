// experiments/latency_test.js
const { MongoClient } = require("mongodb");
const { encrypt } = require("../encryption/field_encryption");
const { generateChecksum } = require("../mongodb/checksum_trigger");
const fs = require("fs");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "dbms_security";

function nowMs() {
  const [sec, nano] = process.hrtime();
  return sec * 1000 + nano / 1e6;
}

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  const col = db.collection("secure_data");

  // clean for repeatability
  await col.deleteMany({});

  const N = 200; // adjust if you want more stable averages
  const rows = [];
  rows.push("method,operation,avg_latency_ms");

  // Method A: checksum only + insert
  {
    let total = 0;
    for (let i = 0; i < N; i++) {
      const data = `data_${i}`;
      const checksum = generateChecksum(data);

      const t0 = nowMs();
      await col.insertOne({ record_id: i, encrypted_field: data, checksum });
      const t1 = nowMs();

      total += (t1 - t0);
    }
    rows.push(`MethodA,insert,${(total / N).toFixed(3)}`);
  }

  await col.deleteMany({});

  // Method B: encryption only + insert (still needs required fields if schema validation enabled)
  {
    let total = 0;
    for (let i = 0; i < N; i++) {
      const enc = encrypt(`data_${i}`);

      const t0 = nowMs();
      // keep checksum as placeholder if schema validation requires it; or generate checksum over encrypted field
      await col.insertOne({ record_id: i, encrypted_field: enc, checksum: "NA" });
      const t1 = nowMs();

      total += (t1 - t0);
    }
    rows.push(`MethodB,insert,${(total / N).toFixed(3)}`);
  }

  await col.deleteMany({});

  // Method C: encryption + checksum + insert
  {
    let total = 0;
    for (let i = 0; i < N; i++) {
      const enc = encrypt(`data_${i}`);
      const checksum = generateChecksum(enc);

      const t0 = nowMs();
      await col.insertOne({ record_id: i, encrypted_field: enc, checksum });
      const t1 = nowMs();

      total += (t1 - t0);
    }
    rows.push(`MethodC,insert,${(total / N).toFixed(3)}`);
  }

  fs.writeFileSync("results/latency_results.csv", rows.join("\n"));
  console.log("Saved results/latency_results.csv");

  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
