const jwt = require("jsonwebtoken");
const https = require("https");

const GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let certCache = null;
let cacheExpiry = 0;

const fetchCerts = () => {
  return new Promise((resolve, reject) => {
    if (certCache && Date.now() < cacheExpiry) {
      return resolve(certCache);
    }

    https.get(GOOGLE_CERTS_URL, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const certs = JSON.parse(data);
          // Cache for 1 hour
          certCache = certs;
          cacheExpiry = Date.now() + 3600000;
          resolve(certs);
        } catch (err) {
          reject(new Error("Failed to parse Google public certificates: " + err.message));
        }
      });
    }).on("error", (err) => {
      reject(new Error("Failed to fetch Google public certificates: " + err.message));
    });
  });
};

/**
 * Verifies the Google Firebase ID token.
 * Throws an error if the token is invalid or expired.
 * @param {string} token 
 * @returns {Promise<object>} The decoded and verified token payload.
 */
const verifyFirebaseToken = async (token) => {
  if (!token) {
    throw new Error("No token provided");
  }

  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error("Invalid Firebase ID token format");
  }

  const certs = await fetchCerts();
  const cert = certs[decoded.header.kid];
  if (!cert) {
    throw new Error("Invalid Firebase ID token signature key ID");
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "ojhub-a3329";
  
  // jwt.verify checks:
  // - signature validity using Google's public cert
  // - token expiration (exp)
  // - audience (aud) matches Firebase project ID
  // - issuer (iss) matches https://securetoken.google.com/<projectId>
  const verified = jwt.verify(token, cert, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  return verified;
};

module.exports = { verifyFirebaseToken };
