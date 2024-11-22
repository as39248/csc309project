# Create environment variables
export BCRYPT_SALT_ROUNDS = 10;
export JWT_SECRET = "dfoaiefnoi2312313";
export JWT_EXPIRES_IN = "1h";

# install needed dependencies
npm install next
npm install prisma
npm install bcrypt
npm install next
npm install jsonwebtoken

# migrate prisma
npx prisma migrate dev --name init

# TODO "this script must also create an admin user, with the username and password being included in the docs", check piazza post 305
node utils/generateAdmin.js
