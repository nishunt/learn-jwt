import mongoose from "mongoose";
import "dotenv/config";
mongoose
  .connect(process.env.DATABASE_URL, {
    dbName: process.env.DBNAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongodb connected..."))
  .catch((error) => console.log(error.message));

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});
mongoose.connection.on("error", (error) => {
  console.log("Mongoose connection error: " + error);
});
mongoose.connection.on("disconnected", () => {
  console.log("\nmongoose connection is disconnected");
});

// close the connection to the DB as I close the terminal activity by pressing ctrl+c
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
