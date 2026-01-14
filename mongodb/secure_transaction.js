// Method C
const { MongoClient } = require("mongodb");
const { encrypt, decrypt } = require("../encryption/field_encryption");
const { generateChecksum, verifyChecksum } = require("./checksum_trigger");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "dbms_security";

async function run() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection("secure_data");

    // Method C workflow: Encrypt -> Checksum -> Store
    const recordId = 1;
    const plainData = "confidential_record";

    const encryptedData = encrypt(plainData);
    const checksum = generateChecksum(encryptedData);

    await col.insertOne({
      record_id: recordId,
      encrypted_field: encryptedData,
      checksum: checksum
    });

    console.log("Inserted secure record.");

    // Verify integrity + decrypt
    const doc = await col.findOne({ record_id: recordId });
    if (!doc) {
      console.log("Record not found.");
      return;
    }

    const ok = verifyChecksum(doc.encrypted_field, doc.checksum);
    if (!ok) {
      console.log("Integrity violation detected.");
      return;
    }

    const decrypted = decrypt(doc.encrypted_field);
    console.log("Integrity verified. Decrypted data:", decrypted);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
