import { wechat } from '../../config/index.js';
import { verifyToken, handleWechatMessage } from '../wechat/index.js';

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function routes(fastify, options) {
  const { path } = wechat;

  fastify.register(await import('fastify-xml-body-parser'));

  fastify.get(path, async ({ query }) => verifyToken(query));

  fastify.post(path, async (request, reply) => {
    const data = await handleWechatMessage(request.body.xml ?? request.body);

    if (data) {
      console.log(`sendTo: ${request.id}`, data);
      const { contentType, content } = data;
      contentType && reply.type(contentType);
      content != null && reply.send(content);
    }
  });
}
