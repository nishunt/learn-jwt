# User Authentication Using JWT

This is a general purpose back-end program that uses:

- JWT (for auth token generation and verification)
- Redis (to store tokens for blacklisting old ones)
- Joi (to enforce login data type)
- bcrypt (to hash the password before storing it to the database)
- mongodb, mongoose (to store the userId and password)
