const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }
});

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING
});

const UserMeta = sequelize.define('UserMeta', {
  userId: DataTypes.INTEGER,
  key: DataTypes.STRING,
  value: DataTypes.STRING
});

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT
});

const PostMeta = sequelize.define('PostMeta', {
  postId: DataTypes.INTEGER,
  key: DataTypes.STRING,
  value: DataTypes.STRING
});

UserMeta.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserMeta, { foreignKey: 'userId' });

PostMeta.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(PostMeta, { foreignKey: 'postId' });

module.exports = { sequelize, User, UserMeta, Post, PostMeta };
