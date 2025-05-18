import { createClient } from 'webdav';

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // WebDAV client
    const webdavClient = createClient(env.WEBDAV_URL, {
      username: env.WEBDAV_USERNAME,
      password: env.WEBDAV_PASSWORD,
    });

    try {
      // Get playlist
      if (path === '/api/playlist' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM playlist ORDER BY position'
        ).all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Add track to playlist
      if (path === '/api/playlist' && request.method === 'POST') {
        const { title, path: trackPath, position } = await request.json();
        const result = await env.DB.prepare(
          'INSERT INTO playlist (title, path, position) VALUES (?, ?, ?)'
        ).bind(title, trackPath, position).run();
        
        const newTrack = await env.DB.prepare(
          'SELECT * FROM playlist WHERE id = ?'
        ).bind(result.meta.last_row_id).first();
        
        return new Response(JSON.stringify(newTrack), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Upload track
      if (path === '/api/upload' && request.method === 'POST') {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const fileName = file.name;
        const filePath = `/music/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        
        // Upload to WebDAV
        await webdavClient.putFileContents(filePath, Buffer.from(arrayBuffer));
        
        // Get last position
        const { results: [lastPosition] } = await env.DB.prepare(
          'SELECT MAX(position) as maxPos FROM playlist'
        ).all();
        
        const nextPosition = (lastPosition?.maxPos || 0) + 1;
        
        // Add to playlist
        const result = await env.DB.prepare(
          'INSERT INTO playlist (title, path, position) VALUES (?, ?, ?)'
        ).bind(fileName, filePath, nextPosition).run();
        
        const newTrack = await env.DB.prepare(
          'SELECT * FROM playlist WHERE id = ?'
        ).bind(result.meta.last_row_id).first();
        
        return new Response(JSON.stringify(newTrack), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get track
      if (path.startsWith('/api/track/') && request.method === 'GET') {
        const trackPath = path.replace('/api/track/', '');
        const stream = await webdavClient.createReadStream(trackPath);
        
        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/mpeg',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
}; 