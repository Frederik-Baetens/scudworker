/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run 'wrangler dev src/index.ts' in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run 'wrangler publish src/index.ts --name my-worker' to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    const digest = request.headers.get('R2_put_digest');

    switch (request.method) {
      case 'PUT':
        await env.scudbucket.put(key, request.body);
        return new Response(`Put ${key} successfully!`);
      case 'POST':
        const options = { md5: digest };
        console.log(digest);
        //console.log(await request.body.getReader());
        await env.scudbucket.put(key, request.body, options);
        return new Response(`Posted ${key} successfully!`);
      case 'GET':
        const object = await env.scudbucket.get(key);

        if (object === null) {
          return new Response('Object Not Found', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);

        return new Response(object.body, {
          headers,
        });
      case 'DELETE':
        await env.scudbucket.delete(key);
        return new Response('Deleted!');

      default:
        return new Response('Method Not Allowed', {
          status: 405,
          headers: {
            Allow: 'PUT, POST, GET, DELETE',
          },
        });
    }
  },
};
