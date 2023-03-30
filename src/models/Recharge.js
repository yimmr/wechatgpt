import { Schema, model } from 'mongoose';

const Recharge = model(
  'recharge',
  new Schema({
    cardNumber: { type: String, required: true },
    value: { type: Number, default: 0, required: true },
    status: { type: String, default: 0, required: true },
    openid: { type: String, required: true, length: 80 },
    receivedTokens: { type: Number, default: 0 },
  })
);

export default Recharge;
