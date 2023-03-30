import { Schema, model } from 'mongoose';

const User = model(
  'user',
  new Schema({
    name: { type: String, length: 80 },
    openid: { type: String, required: true, length: 80 },
    tokens: { type: Number, default: 0 },
    freeTokens: { type: Number, default: 0 },
    freeTokensUpdateAt: { type: Date },
  })
);

export default User;
