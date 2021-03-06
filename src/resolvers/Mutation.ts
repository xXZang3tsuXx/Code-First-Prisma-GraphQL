import { getUserId, hashPwd, createNewToken, validatePassword } from "../util/adapter";

const signUp = async (parent, args, context, info) => {
 const password = await hashPwd(args.password);

 const user = await context.prisma.createUser({ ...args, password });

 const token = createNewToken(user);

 return {
  token,
  user
 }
};

const login = async (parent, args, context, info) => {
 const user = await context.prisma.user({ email: args.email });

 if (!user) {
  throw new Error("No such user found");
 }

 const validPassword = await validatePassword(args.password, user.password);
 if (!validPassword) {
  throw new Error("Invalid password");
 }

 const token = createNewToken(user);

 return {
  token,
  user
 }
};

const post = async (parent, args, context, info) => {
 const userId = getUserId(context);
 return context.prisma.createLink({
  url: args.url,
  description: args.description,
  postedBy: { connect: { id: userId } },
 })
};

const vote = async (parent, args, context, info) => {
 const userId = await getUserId(context);

 const linkExists = await context.prisma.$exists.vote({
  user: { id: userId },
  link: { id: args.linkId }
 });

 if (linkExists) {
  throw new Error(`Already voted for link: ${args.linkId}`)
 }

 return context.prisma.createVote({
  user: { connect: { id: userId } },
  link: { connect: { id: args.linkId } }
 })
};

module.exports = {
 signUp,
 login,
 post,
 vote
}