const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const allPlayerList = [
  { id: 1, name: "Fly", img: "https://via.placeholder.com/120?text=Fly" },
  { id: 2, name: "轩染", img: "https://via.placeholder.com/120?text=轩染" },
  { id: 3, name: "坦然", img: "https://via.placeholder.com/120?text=坦然" },
  { id: 4, name: "清清", img: "https://via.placeholder.com/120?text=清清" },
  { id: 5, name: "诺言", img: "https://via.placeholder.com/120?text=诺言" },
  { id: 6, name: "柠栀", img: "https://via.placeholder.com/120?text=柠栀" },
  { id: 7, name: "归期", img: "https://via.placeholder.com/120?text=归期" },
  { id: 8, name: "梓墨", img: "https://via.placeholder.com/120?text=梓墨" },
  { id: 9, name: "无言", img: "https://via.placeholder.com/120?text=无言" },
  { id: 10, name: "星痕", img: "https://via.placeholder.com/120?text=星痕" },
  { id: 11, name: "久龙", img: "https://via.placeholder.com/120?text=久龙" },
  { id: 12, name: "神人", img: "https://via.placeholder.com/120?text=神人" },
  { id: 13, name: "六点六", img: "https://via.placeholder.com/120?text=六点六" },
  { id: 14, name: "无痕", img: "https://via.placeholder.com/120?text=无痕" },
  { id: 15, name: "英凯", img: "https://via.placeholder.com/120?text=英凯" },
  { id: 16, name: "小度", img: "https://via.placeholder.com/120?text=小度" },
  { id: 17, name: "花缘", img: "https://via.placeholder.com/120?text=花缘" },
  { id: 18, name: "轻语", img: "https://via.placeholder.com/120?text=轻语" },
  { id: 19, name: "萝卜", img: "https://via.placeholder.com/120?text=萝卜" },
  { id: 20, name: "小乐", img: "https://via.placeholder.com/120?text=小乐" },
  { id: 21, name: "小泽", img: "https://via.placeholder.com/120?text=小泽" },
  { id: 22, name: "流星", img: "https://via.placeholder.com/120?text=流星" },
  { id: 23, name: "小落", img: "https://via.placeholder.com/120?text=小落" },
  { id: 24, name: "无幻", img: "https://via.placeholder.com/120?text=无幻" },
  { id: 25, name: "樱花", img: "https://via.placeholder.com/120?text=樱花" },
  { id: 26, name: "誓约", img: "https://via.placeholder.com/120?text=誓约" },
  { id: 27, name: "天云", img: "https://via.placeholder.com/120?text=天云" },
  { id: 28, name: "奶龙", img: "https://via.placeholder.com/120?text=奶龙" },
  { id: 29, name: "钟意", img: "https://via.placeholder.com/120?text=钟意" },
  { id: 30, name: "小胖", img: "https://via.placeholder.com/120?text=小胖" },
  { id: 31, name: "暖阳", img: "https://via.placeholder.com/120?text=暖阳" },
  { id: 32, name: "句号", img: "https://via.placeholder.com/120?text=句号" },
  { id: 33, name: "今屿", img: "https://via.placeholder.com/120?text=今屿" },
  { id: 34, name: "皖皖", img: "https://via.placeholder.com/120?text=皖皖" },
  { id: 35, name: "小轩", img: "https://via.placeholder.com/120?text=小轩" },
  { id: 36, name: "花海", img: "https://via.placeholder.com/120?text=花海" },
  { id: 37, name: "梦泪", img: "https://via.placeholder.com/120?text=梦泪" },
  { id: 38, name: "夏凌", img: "https://via.placeholder.com/120?text=夏凌" },
  { id: 39, name: "染详", img: "https://via.placeholder.com/120?text=染详" },
  { id: 40, name: "米苏", img: "https://via.placeholder.com/120?text=米苏" },
  { id: 41, name: "无双", img: "https://via.placeholder.com/120?text=无双" },
  { id: 42, name: "落尘", img: "https://via.placeholder.com/120?text=落尘" },
  { id: 43, name: "小楼", img: "https://via.placeholder.com/120?text=小楼" },
  { id: 44, name: "余忆", img: "https://via.placeholder.com/120?text=余忆" },
  { id: 45, name: "安凉", img: "https://via.placeholder.com/120?text=安凉" },
  { id: 46, name: "书源", img: "https://via.placeholder.com/120?text=书源" },
  { id: 47, name: "佳心", img: "https://via.placeholder.com/120?text=佳心" },
  { id: 48, name: "bao", img: "https://via.placeholder.com/120?text=bao" },
  { id: 49, name: "长生", img: "https://via.placeholder.com/120?text=长生" },
  { id: 50, name: "清融", img: "https://via.placeholder.com/120?text=清融" },
  { id: 51, name: "向鱼", img: "https://via.placeholder.com/120?text=向鱼" },
  { id: 52, name: "流浪", img: "https://via.placeholder.com/120?text=流浪" },
  { id: 53, name: "紫幻", img: "https://via.placeholder.com/120?text=紫幻" },
  { id: 54, name: "听悦", img: "https://via.placeholder.com/120?text=听悦" },
  { id: 55, name: "Ming", img: "https://via.placeholder.com/120?text=Ming" },
  { id: 56, name: "花卷", img: "https://via.placeholder.com/120?text=花卷" },
  { id: 57, name: "九尾", img: "https://via.placeholder.com/120?text=九尾" },
  { id: 58, name: "鹤辞", img: "https://via.placeholder.com/120?text=鹤辞" },
  { id: 59, name: "Cat", img: "https://via.placeholder.com/120?text=Cat" },
  { id: 60, name: "老帅", img: "https://via.placeholder.com/120?text=老帅" },
  { id: 61, name: "久诚", img: "https://via.placeholder.com/120?text=久诚" },
  { id: 62, name: "一曲", img: "https://via.placeholder.com/120?text=一曲" },
  { id: 63, name: "瓶子", img: "https://via.placeholder.com/120?text=瓶子" },
  { id: 64, name: "昊昊", img: "https://via.placeholder.com/120?text=昊昊" },
  { id: 65, name: "玖熙", img: "https://via.placeholder.com/120?text=玖熙" },
  { id: 66, name: "吕成林", img: "https://via.placeholder.com/120?text=吕成林" },
  { id: 67, name: "小名", img: "https://via.placeholder.com/120?text=小名" },
  { id: 68, name: "挽墨", img: "https://via.placeholder.com/120?text=挽墨" },
  { id: 69, name: "久哲", img: "https://via.placeholder.com/120?text=久哲" },
  { id: 70, name: "一诺", img: "https://via.placeholder.com/120?text=一诺" },
  { id: 71, name: "妖刀", img: "https://via.placeholder.com/120?text=妖刀" },
  { id: 72, name: "小麦", img: "https://via.placeholder.com/120?text=小麦" },
  { id: 73, name: "小俞", img: "https://via.placeholder.com/120?text=小俞" },
  { id: 74, name: "小屿", img: "https://via.placeholder.com/120?text=小屿" },
  { id: 75, name: "风箫", img: "https://via.placeholder.com/120?text=风箫" },
  { id: 76, name: "道崽", img: "https://via.placeholder.com/120?text=道崽" },
  { id: 77, name: "钎城", img: "https://via.placeholder.com/120?text=钎城" },
  { id: 78, name: "梦岚", img: "https://via.placeholder.com/120?text=梦岚" },
  { id: 79, name: "乔兮", img: "https://via.placeholder.com/120?text=乔兮" },
  { id: 80, name: "小雪", img: "https://via.placeholder.com/120?text=小雪" },
  { id: 81, name: "刺痛", img: "https://via.placeholder.com/120?text=刺痛" },
  { id: 82, name: "Hurt", img: "https://via.placeholder.com/120?text=Hurt" },
  { id: 83, name: "亮宇", img: "https://via.placeholder.com/120?text=亮宇" },
  { id: 84, name: "灵儿", img: "https://via.placeholder.com/120?text=灵儿" },
  { id: 85, name: "sk", img: "https://via.placeholder.com/120?text=sk" },
  { id: 86, name: "绝意", img: "https://via.placeholder.com/120?text=绝意" },
  { id: 87, name: "小玖", img: "https://via.placeholder.com/120?text=小玖" },
  { id: 88, name: "零栩", img: "https://via.placeholder.com/120?text=零栩" },
  { id: 89, name: "小寒", img: "https://via.placeholder.com/120?text=小寒" },
  { id: 90, name: "小涵", img: "https://via.placeholder.com/120?text=小涵" },
  { id: 91, name: "小久", img: "https://via.placeholder.com/120?text=小久" },
  { id: 92, name: "子阳", img: "https://via.placeholder.com/120?text=子阳" },
  { id: 93, name: "大帅", img: "https://via.placeholder.com/120?text=大帅" },
  { id: 94, name: "帆帆", img: "https://via.placeholder.com/120?text=帆帆" },
  { id: 95, name: "一笙", img: "https://via.placeholder.com/120?text=一笙" },
  { id: 96, name: "阿豆", img: "https://via.placeholder.com/120?text=阿豆" },
  { id: 97, name: "无畏", img: "https://via.placeholder.com/120?text=无畏" },
  { id: 98, name: "久酷", img: "https://via.placeholder.com/120?text=久酷" },
  { id: 99, name: "玖欣", img: "https://via.placeholder.com/120?text=玖欣" },
  { id: 100, name: "冰尘", img: "https://via.placeholder.com/120?text=冰尘" },
  { id: 101, name: "梦溪", img: "https://via.placeholder.com/120?text=梦溪" },
  { id: 102, name: "信", img: "https://via.placeholder.com/120?text=信" },
  { id: 103, name: "晚星", img: "https://via.placeholder.com/120?text=晚星" },
  { id: 104, name: "小崽", img: "https://via.placeholder.com/120?text=小崽" },
  { id: 105, name: "白清", img: "https://via.placeholder.com/120?text=白清" },
  { id: 106, name: "小鹿", img: "https://via.placeholder.com/120?text=小鹿" },
  { id: 107, name: "小A", img: "https://via.placeholder.com/120?text=小A" },
  { id: 108, name: "救赎", img: "https://via.placeholder.com/120?text=救赎" },
  { id: 109, name: "萧玦", img: "https://via.placeholder.com/120?text=萧玦" },
  { id: 110, name: "北岛", img: "https://via.placeholder.com/120?text=北岛" },
  { id: 111, name: "落空", img: "https://via.placeholder.com/120?text=落空" },
  { id: 112, name: "星宇", img: "https://via.placeholder.com/120?text=星宇" },
  { id: 113, name: "涛", img: "https://via.placeholder.com/120?text=涛" },
  { id: 114, name: "gemini", img: "https://via.placeholder.com/120?text=gemini" },
  { id: 115, name: "李九", img: "https://via.placeholder.com/120?text=李九" }
];

const rooms = {};

function shuffle(arr) {
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resetRoom(r, diff){
  let pickCount;
  if(diff === "easy") pickCount = 30;
  else if(diff === "mid") pickCount = 60;
  else pickCount = allPlayerList.length;
  const sh = shuffle(allPlayerList);
  r.pool = sh.slice(0, pickCount);
  r.status = "pick";
  r.turn = null;
  for(const p of r.players){
    p.secretPlayer = null;
    p.guessChance = 1;
    p.mark = {};
  }
}

io.on('connection', socket=>{
  console.log("玩家连上", socket.id);

  socket.on("joinRoom", ({roomId, pwd, diff})=>{
    const key = roomId;
    if(!rooms[key]){
      rooms[key] = {
        password: pwd,
        diff: diff,
        players: [],
        pool: [],
        turn: null,
        status: "waiting"
      }
    }
    const r = rooms[key];
    if(r.password !== pwd){
      socket.emit("msg", "密码错误");
      return;
    }
    if(r.players.length >= 2){
      socket.emit("msg", "房间已满");
      return;
    }
    if(r.status === "waiting"){
      r.players.push({
        sid: socket.id,
        secretPlayer: null,
        guessChance: 1,
        mark: {}
      })
    }
    socket.join(key);
    socket.emit("joined", {roomId});
    io.to(key).emit("roomUpdate", {num: r.players.length});

    if(r.players.length === 2){
      resetRoom(r, r.diff);
      io.to(key).emit("startPick", {pool: r.pool});
    }
  })

  socket.on("selectSecret", ({roomId, pid})=>{
    const r = rooms[roomId];
    if(!r) return;
    const me = r.players.find(x=>x.sid === socket.id);
    if(!me) return;
    me.secretPlayer = pid;
    const ready = r.players.every(p=>p.secretPlayer !== null);
    if(ready){
      r.status = "playing";
      r.turn = r.players[0].sid;
      io.to(roomId).emit("gameStart", {turn: r.turn});
    }
  })

  socket.on("askQuestion", ({roomId, q})=>{
    const r = rooms[roomId];
    if(!r || r.turn !== socket.id) return;
    io.to(roomId).emit("newQuestion", {from: socket.id, q});
  })

  socket.on("replyAns", ({roomId, ans})=>{
    const r = rooms[roomId];
    if(!r) return;
    const other = r.players.find(x=>x.sid !== socket.id);
    r.turn = other.sid;
    io.to(roomId).emit("reply", {ans, nextTurn: r.turn});
  })

  socket.on("makeGuess", ({roomId, guessName})=>{
    const r = rooms[roomId];
    if(!r) return;
    const me = r.players.find(x=>x.sid === socket.id);
    if(!me || me.guessChance <= 0) return;
    me.guessChance -= 1;
    const enemy = r.players.find(x=>x.sid !== socket.id);
    const enemySecret = r.pool.find(x=>x.id === enemy.secretPlayer);
    const right = enemySecret.name.toLowerCase() === guessName.toLowerCase();
    io.to(roomId).emit("guessResult", {right, winner: right ? socket.id : null, secretName: enemySecret.name});
  })

  socket.on("markPlayer", ({roomId, pid, markType})=>{
    const r = rooms[roomId];
    if(!r) return;
    const me = r.players.find(x=>x.sid === socket.id);
    if(!me) return;
    me.mark[pid] = markType;
    socket.emit("markSync", {mark: me.mark});
  })

  socket.on("restartGame", ({roomId})=>{
    const r = rooms[roomId];
    if(!r) return;
    resetRoom(r, r.diff);
    io.to(roomId).emit("startPick", {pool: r.pool});
  })

  socket.on("disconnect", ()=>{
    for(const k in rooms){
      const r = rooms[k];
      r.players = r.players.filter(p=>p.sid !== socket.id);
      if(r.players.length === 0) delete rooms[k];
      else io.to(k).emit("msg", "对手离开了房间");
    }
  })
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
  console.log("server run", PORT);
})
