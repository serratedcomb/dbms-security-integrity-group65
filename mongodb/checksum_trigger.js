// Method A
const crypto = require("crypto");

//Generate SHA-256 checksum for integrity verification
function generateChecksum(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

//Verify checksum by recalculating
function verifyChecksum(data, checksum) {
  return generateChecksum(data) === checksum;
}

module.exports = {
  generateChecksum,
  verifyChecksum
};
