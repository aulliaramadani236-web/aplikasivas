import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(req.url.split('?')[0]);
    const resolved=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!resolved.startsWith(root+path.sep)||pathname.split('/').some(segment=>segment.startsWith('.')))throw Error();
    const contents=await readFile(resolved);
    res.setHeader('Content-Type',(types[path.extname(resolved)]||'text/plain')+'; charset=utf-8');
    res.setHeader('Cache-Control','no-store');res.end(contents);
  }catch{res.writeHead(404);res.end('Tidak ditemukan');}
}).listen(3001,'127.0.0.1',()=>console.log('VAS: http://127.0.0.1:3001'));
