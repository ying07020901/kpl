const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

const rawPlayerList = [
  "Fly","轩染","坦然","清清","诺言","柠栀","归期","梓墨","无言","星痕",
  "久龙","神人","六点六","无痕","英凯","小度","花缘","轻语","萝卜","小乐",
  "小泽","流星","小落","无幻","樱花","誓约","天云","奶龙","钟意","小胖",
  "暖阳","句号","今屿","皖皖","小轩","花海","梦泪","夏凌","染详","米苏",
  "无双","落尘","小楼","余忆","安凉","书源","佳心","bao","长生","清融",
  "向鱼","流浪","紫幻","听悦","Ming","花卷","九尾","鹤辞","Cat","老帅",
  "久诚","一曲","瓶子","昊昊","玖熙","吕成林","小名","挽墨","久哲","一诺",
  "妖刀","小麦","小俞","小屿","风箫","道崽","钎城","梦岚","乔兮","小雪",
  "刺痛","Hurt","亮宇","灵儿","sk","绝意","小玖","零栩","小寒","小涵",
  "小久","子阳","大帅","帆帆","一笙","阿豆","无畏","久酷","玖欣","冰尘",
  "梦溪","信","晚星","小崽","白清","小鹿","小A","救赎","萧玦","北岛",
  "落空","星宇","涛","gemini","李九"
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const roomMap = {};

io.on('connection', (socket) => {
  console.log("连接：", socket.id);

  socket.on("create_room", ({ roomId, pwd, diff }) => {
    if (roomMap[roomId]) {
      socket.emit("msg", { type: "err", text: "房间号已存在！" });
      return;
    }
    let pool;
    const shuffled = shuffle(rawPlayerList);
    if (diff === "easy") pool = shuffled.slice(0, 30);
    else if (diff === "mid") pool = shuffled.slice(0, 60);
    else pool = shuffled;

    roomMap[roomId] = {
      password: pwd,
      owner: socket.id,
      diff,
      playerPool: pool,
      players: [
        { sid: socket.id, selected: null, guessUsed: false }
      ],
      turn: null,
      gameStarted: false
    };
    socket.join(roomId);
    socket.emit("msg", { type: "ok", text: "房间创建成功！等待好友加入" });
    socket.emit("enter_lobby", { roomId, isOwner: true });
  });

  socket.on("join_room", ({ roomId, pwd }) => {
    const r = roomMap[roomId];
    if (!r) return socket.emit("msg", { type: "err", text: "房间不存在" });
    if (r.password !== pwd) return socket.emit("msg", { type: "err", text: "密码错误" });
    if (r.players.length >= 2) return socket.emit("msg", { type: "err", text: "房间已满" });
    r.players.push({ sid: socket.id, selected: null, guessUsed: false });
    socket.join(roomId);
    socket.emit("msg", { type: "ok", text: "成功进入房间" });
    socket.emit("enter_lobby", { roomId, isOwner: false });
    io.to(roomId).emit("room_refresh", { count: r.players.length });
  });

  socket.on("start_game", (roomId) => {
    const r = roomMap[roomId];
    if (!r || r.owner !== socket.id) return;
    if (r.players.length < 2) return;
    r.gameStarted = true;
    r.turn = r.players[0].sid;
    io.to(roomId).emit("game_begin", { pool: r.playerPool });
  });

  socket.on("pick_target", ({ roomId, name }) => {
    const r = roomMap[roomId];
    if (!r) return;
    const me = r.players.find(p => p.sid === socket.id);
    if (!me) return;
    me.selected = name;
    const allReady = r.players.every(p => p.selected !== null);
    if (allReady) {
      io.to(roomId).emit("all_selected", { firstTurn: r.turn });
    } else {
      socket.emit("msg", { type: "ok", text: "已选好，等待对方选择选手" });
    }
  });

  socket.on("ask_question", ({ roomId, q }) => {
    const r = roomMap[roomId];
    if (!r || r.turn !== socket.id) return;
    io.to(roomId).emit("new_question", { from: socket.id, text: q });
  });

  socket.on("reply_answer", ({ roomId, ans }) => {
    const r = roomMap[roomId];
    if (!r) return;
    const other = r.players.find(p => p.sid !== socket.id);
    r.turn = other.sid;
    io.to(roomId).emit("answer_result", { ans, nextTurn: r.turn });
  });

  socket.on("make_guess", ({ roomId, guessName }) => {
    const r = roomMap[roomId];
    if (!r) return;
    const me = r.players.find(p => p.sid === socket.id);
    if (!me || me.guessUsed) return;
    me.guessUsed = true;
    const enemy = r.players.find(p => p.sid !== socket.id);
    if (enemy.selected === guessName) {
      io.to(roomId).emit("game_win", { winner: socket.id, target: enemy.selected });
    } else {
      io.to(roomId).emit("guess_wrong", { loser: socket.id });
    }
  });

  socket.on("restart_room", (roomId) => {
    const r = roomMap[roomId];
    if (!r || r.owner !== socket.id) return;
    const diff = r.diff;
    const shuffled = shuffle(rawPlayerList);
    let pool;
    if (diff === "easy") pool = shuffled.slice(0, 30);
    else if (diff === "mid") pool = shuffled.slice(0, 60);
    else pool = shuffled;

    r.playerPool = pool;
    r.players = r.players.map(p => ({ ...p, selected: null, guessUsed: false }));
    r.turn = null;
    r.gameStarted = false;
    io.to(roomId).emit("reset_game");
  });

  socket.on('disconnect', () => {
    for (const rid in roomMap) {
      const r = roomMap[rid];
      const idx = r.players.findIndex(p => p.sid === socket.id);
      if (idx !== -1) {
        r.players.splice(idx, 1);
        io.to(rid).emit("msg", { type: "err", text: "队友断开连接" });
        if (r.players.length === 0) delete roomMap[rid];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listen on ${PORT}`);
});
