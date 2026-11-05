const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

const allPlayers = [
  "Fly","轩染","坦然","清清","诺言","柠栀","归期","梓墨","无言","星痕","久龙","神人","六点六","无痕","英凯","小度","花缘","轻语","萝卜","小乐","小泽","流星","小落","无幻","樱花","誓约","天云","奶龙",
  "钟意","小胖","暖阳","句号","今屿","皖皖","小轩","花海","梦泪","夏凌","染详","米苏","无双","落尘","小楼","余忆","安凉","书源","佳心","bao",
  "长生","清融","向鱼","流浪","紫幻","听悦","Ming","花卷","九尾","鹤辞","Cat","老帅","久诚","一曲","瓶子","昊昊","玖熙","吕成林","小名","挽墨","久哲",
  "一诺","妖刀","小麦","小俞","小屿","风箫","道崽","钎城","梦岚","乔兮","小雪","刺痛","Hurt","亮宇","灵儿","sk","绝意","小玖","零栩","小寒","小久",
  "子阳","大帅","帆帆","一笙","阿豆","无畏","久酷","玖欣","冰尘","梦溪","信","晚星","小崽","白清","小鹿","小A","救赎","萧玦","北岛","落空","星宇","涛","gemini","李九"
];

function getPlayerList(diff) {
  const arr = [...allPlayers];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (diff === "easy") return arr.slice(0, 30);
  if (diff === "mid") return arr.slice(0, 60);
  return arr;
}

const rooms = {};

io.on('connection', (socket) => {

  socket.on('createRoom', ({ roomId, pwd, diff }) => {
    if (rooms[roomId]) {
      socket.emit('msg', "房间已存在");
      return;
    }
    const list = getPlayerList(diff);
    rooms[roomId] = {
      pwd,
      diff,
      playerList: list,
      players: {},
      started: false,
      turn: null
    };
    rooms[roomId].players[socket.id] = {
      isHost: true,
      target: null,
      guessUsed: false
    };
    socket.join(roomId);
    socket.emit('enterRoom', {
      isHost: true,
      playerList: list,
      count: 1
    });
  });

  socket.on('joinRoom', ({ roomId, pwd }) => {
    const r = rooms[roomId];
    if (!r) return socket.emit('msg', "房间不存在");
    if (r.pwd !== pwd) return socket.emit('msg', "密码错误");
    if (Object.keys(r.players).length >= 2) return socket.emit('msg', "房间已满");
    if (r.started) return socket.emit('msg', "游戏已经开始");

    r.players[socket.id] = {
      isHost: false,
      target: null,
      guessUsed: false
    };
    socket.join(roomId);
    const cnt = Object.keys(r.players).length;
    io.to(roomId).emit('updateCount', cnt);
    socket.emit('enterRoom', {
      isHost: false,
      playerList: r.playerList,
      count: cnt
    });
    if (cnt === 2) {
      io.to(roomId).emit('roomFull');
    }
  });

  socket.on('hostStartGame', (roomId) => {
    const r = rooms[roomId];
    if (!r) return;
    const ids = Object.keys(r.players);
    if (ids.length < 2) return;
    r.started = true;
    r.turn = ids[0];
    io.to(roomId).emit('gameStart', { firstTurn: r.turn });
  });

  socket.on('selectTarget', ({ roomId, name }) => {
    const r = rooms[roomId];
    if (!r) return;
    r.players[socket.id].target = name;
  });

  socket.on('ask', ({ roomId, q }) => {
    const r = rooms[roomId];
    if (!r || r.turn !== socket.id) return;
    io.to(roomId).emit('recvAsk', {
      from: socket.id,
      question: q
    });
  });

  socket.on('reply', ({ roomId, ans }) => {
    const r = rooms[roomId];
    if (!r) return;
    const others = Object.keys(r.players).find(k => k !== socket.id);
    r.turn = others;
    io.to(roomId).emit('recvReply', {
      ans,
      nextTurn: others
    });
  });

  socket.on('guess', ({ roomId, guessName }) => {
    const r = rooms[roomId];
    if (!r) return;
    const me = r.players[socket.id];
    if (me.guessUsed) return socket.emit('msg', "你已经用完猜测机会！");
    me.guessUsed = true;
    const oppoId = Object.keys(r.players).find(k => k !== socket.id);
    const oppoTarget = r.players[oppoId].target;
    const win = guessName.trim().toLowerCase() === oppoTarget.trim().toLowerCase();
    io.to(roomId).emit('guessResult', {
      win,
      guesser: socket.id,
      guessName,
      answer: oppoTarget
    });
  });

  socket.on('restart', (roomId) => {
    const r = rooms[roomId];
    if (!r) return;
    const diff = r.diff;
    const list = getPlayerList(diff);
    r.playerList = list;
    r.started = false;
    r.turn = null;
    Object.values(r.players).forEach(p => {
      p.target = null;
      p.guessUsed = false;
    });
    io.to(roomId).emit('restartGame', { playerList: list });
  });

  socket.on('disconnect', () => {
    for (const rid in rooms) {
      const r = rooms[rid];
      if (r.players[socket.id]) {
        delete r.players[socket.id];
        io.to(rid).emit('msg', "队友断开连接");
        if (Object.keys(r.players).length === 0) {
          delete rooms[rid];
        } else {
          io.to(rid).emit('updateCount', Object.keys(r.players).length);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
// ✅ Render必须写 "0.0.0.0"
server.listen(PORT, "0.0.0.0", () => {
  console.log(`服务启动成功，端口:${PORT}`);
});
