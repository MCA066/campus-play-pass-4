// Browser-local chess archive. Each game is written independently.
export const ARCHIVE='campusplay.chess.v1.';
export function readGames(storage=globalThis.localStorage){
 const games=[];try{for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(ARCHIVE))continue;try{const g=JSON.parse(storage.getItem(key));if(g&&typeof g.id==='string'&&Array.isArray(g.moves))games.push(g)}catch{}}}catch{}
 return games.sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
}
export function writeGame(game,storage=globalThis.localStorage){
 try{storage.setItem(ARCHIVE+game.id,JSON.stringify(game));return true}catch{return false}
}
export function rebuild(Chess,moves){if(!Array.isArray(moves)||moves.length>3000)throw Error('Invalid move history');const g=new Chess();for(const m of moves){if(!m||!/^([a-h][1-8])$/.test(m.from)||!/^([a-h][1-8])$/.test(m.to)||m.promotion&&!/^[qrbn]$/.test(m.promotion))throw Error('Invalid move');if(g.isGameOver())throw Error('Game already over');g.move({from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})})}return g}
export function resultOf(g){if(g.isCheckmate())return g.turn()==='w'?'0-1':'1-0';if(g.isDraw())return '1/2-1/2';return '*'}
export function legalMove(Chess,game,move,color){if(game.result!=='*')throw Error('Game is finished');const g=rebuild(Chess,game.moves);if(color&&g.turn()!==color)throw Error('Not your turn');if(g.isGameOver())throw Error('Game is finished');const m=g.move({from:move.from,to:move.to,...(move.promotion?{promotion:move.promotion}:{})});return {...game,moves:[...game.moves,{from:m.from,to:m.to,...(m.promotion?{promotion:m.promotion}:{})}],result:resultOf(g),reason:g.isCheckmate()?'Checkmate':g.isDraw()?'Draw by rules':'',updated:new Date().toISOString()}}
export function cleanName(n){return String(n||'Player').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,60)||'Player'}
export const roomPattern=/^[a-f0-9]{32}$/;
export const token=()=>crypto.randomUUID().replaceAll('-','');
