
import { error, type Handle } from '@sveltejs/kit';
//import { getRelatedCollections } from '$lib/utils';


export const handle: Handle = async ({ event, resolve }) => {
  // Apply CORS header for API routes
  if (event.url.pathname.startsWith('/api')) {
    // Required for CORS to work
    if(event.request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }
  }

  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('data-theme=""', `data-theme="dark"`)
  });
  
  if (event.url.pathname.startsWith('/api')) {
      response.headers.append('Access-Control-Allow-Origin', `*`);
  }
  return response;
};
