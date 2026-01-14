// Method A

db.createCollection("secure_data", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["record_id", "encrypted_field", "checksum"],
      properties: {
        record_id: {
          bsonType: "int",
          description: "Must be an integer and is required"
        },
        encrypted_field: {
          bsonType: "string",
          description: "Encrypted data (hex string)"
        },
        checksum: {
          bsonType: "string",
          description: "SHA-256 checksum for integrity verification"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("Collection 'secure_data' created with schema validation.");
