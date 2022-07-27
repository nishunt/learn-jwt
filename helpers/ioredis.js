import Redis from "ioredis";
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

// using helper functions from the redis
redis.on("connect", () => {
  console.log("redis connected to redis...");
});
redis.on("ready", () => {
  console.log("redis ready to use...");
});

redis.on("error", (error) => {
  console.log(error.message);
});
redis.on("end", () => {
  console.log("redis connected from redis...");
});

process.on("SIGINT", () => {
  redis.quit();
});
export default redis;
