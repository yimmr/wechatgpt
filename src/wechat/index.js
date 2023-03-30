import sha1 from 'sha1';
import passiveReplyMessage from './passive-reply-message.js';

function verifyToken({ signature, timestamp, nonce, echostr }) {
  return sha1([process.env.WECHAT_TOKEN || '', timestamp, nonce].sort().join('')) === signature
    ? echostr
    : 'Error';
}

async function handleWechatMessage(message) {
  return await passiveReplyMessage(message);
}

export { handleWechatMessage, verifyToken };
