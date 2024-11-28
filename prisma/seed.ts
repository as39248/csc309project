import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Create 30 users
  const users = [];
  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
        phoneNumber: faker.phone.number(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        role: faker.helpers.arrayElement(['USER', 'ADMIN']),
      },
    });
    users.push(user);
  }

  // Create 30 posts
  const posts = [];
  for (let i = 0; i < 30; i++) {
    const post = await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        tag: faker.lorem.word(), 
        upvotes: faker.number.int({ min: 0, max: 1000 }),
        downvotes: faker.number.int({ min: 0, max: 1000 }),
        user: {
          create: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            password: faker.internet.password(),
            phoneNumber: faker.phone.number(),
            email: faker.internet.email(),
            avatar: faker.image.avatar(),
          }
        }
      },
    });
    posts.push(post);
  }

  // Create 30 comments for posts
  const comments = [];
  for (let i = 0; i < 30; i++) {
    const comment = await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        upvotes: faker.number.int({ min: 0, max: 100 }),
        downvotes: faker.number.int({ min: 0, max: 100 }),
        postId: faker.helpers.arrayElement(posts).id,
        userId: faker.helpers.arrayElement(users).id,
      },
    });
    comments.push(comment);
  }

  // Create 30 templates
  const templates = [];
  for (let i = 0; i < 30; i++) {
    const template = await prisma.template.create({
      data: {
        title: faker.lorem.words(3),
        explanation: faker.lorem.paragraph(),
        tags: faker.lorem.word(),
        userId: faker.helpers.arrayElement(users).id,
        code: faker.lorem.paragraph(),
        isForked: faker.datatype.boolean(),
      },
    });
    templates.push(template);
  }

  // Create reports for some posts and comments (optional)
  const reports = [];
  for (let i = 0; i < 30; i++) {
    const isPostReport = faker.datatype.boolean();
    const report = await prisma.report.create({
      data: {
        explanation: faker.lorem.sentence(),
        postId: isPostReport ? faker.helpers.arrayElement(posts).id : null,
        commentId: isPostReport ? null : faker.helpers.arrayElement(comments).id,
      },
    });
    reports.push(report);
  }

  console.log('30 Users, Posts, Comments, Templates, and Reports have been created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
