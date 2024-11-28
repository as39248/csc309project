# Create environment variables
export BCRYPT_SALT_ROUNDS=10
export JWT_SECRET="sfrb098j24t"
export JWT_EXPIRES_IN="1h"
export JWT_SECRET_REFRESH="qpegnqepg9qp"
export JWT_EXPIRES_IN_REFRESH="7d"

# install needed dependencies
npm install

# migrate prisma
npx prisma generate
npx prisma migrate dev --name init

# TODO "this script must also create an admin user, with the username and password being included in the docs", check piazza post 305
node utils/generateAdmin.js
