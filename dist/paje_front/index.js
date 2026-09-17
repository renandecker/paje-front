const worker = {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }
    const url = new URL(request.url);
    return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
  }
};
const workerEntry = worker ?? {};
export {
  workerEntry as default
};
