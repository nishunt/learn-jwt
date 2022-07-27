import crypto from "crypto";
// we'll use this file to generate random keys

// whenever you think your server is being misused, you should generate a new key
const key1 = crypto.randomBytes(32).toString("hex");
const key2 = crypto.randomBytes(32).toString("hex");
console.table({ key1, key2 });
