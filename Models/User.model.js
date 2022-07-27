import mongoose from "mongoose";
import bcrypt from "bcrypt";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// pre save takes place before saving the data
// post save takes place after saving the data
// Here we are providing a middleware that does the following before saving the UserSchema(thus, pre() is used):
// converting the password into an encrypted hash before saving it to the DB

UserSchema.pre("save", async function (next) {
  // we are not using arrow function above because arrow function does not allow for the "this" keyword
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    // passing the middleware flow forward⬇️
    next();
  } catch (error) {
    next(error);
  }
});

// make a method that can check if the password is valid or not

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("user", UserSchema);
export default User;
