export default {
    async fetch(request, env, ctx) {
        // Tenta buscar o recurso estático na pasta ./dist
        const response = await env.ASSETS.fetch(request);

        // Se o recurso existir (JS, CSS, imagens), retorna diretamente
        if (response.status !== 404) {
            return response;
        }

        // Se for uma rota de navegacao da SPA (retornou 404), serve o index.html
        const url = new URL(request.url);
        return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    },
};