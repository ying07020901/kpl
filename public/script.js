const socket = io();
let roomId = null;
let mySid = null;
let pool = [];
let myMark = {};
let diffMode = "easy";

const enterPanel = document.getElementById("enterPanel");
const pickPanel = document.getElementById("pickPanel");
const gamePanel = document.getElementById("gamePanel");
const tipMsg = document.getElementById("tipMsg");
const pickGrid = document.getElementById("pickGrid");
const gameGrid = document.getElementById("gameGrid");
const turnText = document.getElementById("turnText");
const guessLeft = document.getElementById("guessLeft");
const chatBox = document.getElementById("chatBox");
const questionInp = document.getElementById("questionInp");
const askBtn = document.getElementById("askBtn");
const replyRow = document.getElementById("replyRow");
const qShow = document.getElementById("qShow");
const guessInp = document.getElementById("guessInp");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");

function renderGrid(container, list, isPick = false){
  container.innerHTML = "";
  list.forEach(p=>{
    const div = document.createElement("div");
    div.className = "playerCard";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div>${p.name}</div>
      <div class="mark-cross" style="display:${myMark[p.id]==='cross'?'grid':'none'}">✕</div>
      <div class="mark-q" style="display:${myMark[p.id]==='q'?'grid':'none'}">？</div>
    `
    if(isPick){
      div.onclick = ()=>{
        socket.emit("selectSecret", {roomId, pid:p.id});
        tipMsg.textContent = "你选中了："+p.name+"，等待对手选择";
      }
    }else{
      div.onclick = ()=>{
        myMark[p.id] = "cross";
        socket.emit("markPlayer", {roomId, pid:p.id, markType:"cross"});
        renderGrid(gameGrid, pool, false);
      }
      div.ondblclick = (e)=>{
        e.preventDefault();
        myMark[p.id] = "q";
        socket.emit("markPlayer", {roomId, pid:p.id, markType:"q"});
        renderGrid(gameGrid, pool, false);
      }
    }
    container.appendChild(div);
  })
}

function addChat(text){
  const d = document.createElement("div");
  d.textContent = text;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("joinBtn").onclick = ()=>{
  const rid = document.getElementById("roomId").value.trim();
  const pwd = document.getElementById("roomPwd").value.trim();
  diffMode = document.querySelector('input[name="diff"]:checked').value;
  if(!rid || !pwd){
    tipMsg.textContent = "房间号和密码不能为空";
    return;
  }
  socket.emit("joinRoom", {roomId:rid, pwd, diff: diffMode});
}

askBtn.onclick = ()=>{
  const q = questionInp.value.trim();
  if(!q) return;
  socket.emit("askQuestion", {roomId, q});
  questionInp.value = "";
}

replyRow.querySelectorAll("button").forEach(btn=>{
  btn.onclick = ()=>{
    const a = btn.dataset.a;
    socket.emit("replyAns", {roomId, ans:a});
    replyRow.classList.add("hide");
  }
})

guessBtn.onclick = ()=>{
  const name = guessInp.value.trim();
  if(!name) return;
  socket.emit("makeGuess", {roomId, guessName: name});
}

restartBtn.onclick = ()=>{
  if(!roomId) return;
  myMark = {};
  chatBox.innerHTML = "";
  socket.emit("restartGame", {roomId});
}

socket.on("joined", d=>{
  roomId = d.roomId;
  mySid = socket.id;
  enterPanel.classList.add("hide");
  tipMsg.textContent = "等待另一位玩家加入房间";
})
socket.on("roomUpdate", d=>{
  tipMsg.textContent = `当前房间人数：${d.num}/2`;
})
socket.on("startPick", d=>{
  pool = d.pool;
  myMark = {};
  pickPanel.classList.remove("hide");
  gamePanel.classList.add("hide");
  renderGrid(pickGrid, pool, true);
})
socket.on("gameStart", d=>{
  pickPanel.classList.add("hide");
  gamePanel.classList.remove("hide");
  guessLeft.textContent = "1";
  renderGrid(gameGrid, pool, false);
  turnText.textContent = d.turn === mySid ? "✅ 轮到你提问" : "⏳ 等待对方提问";
})
socket.on("newQuestion", d=>{
  addChat("对方提问：" + d.q);
  if(d.from !== mySid){
    qShow.textContent = d.q;
    replyRow.classList.remove("hide");
  }
})
socket.on("reply", d=>{
  addChat("对方回答：" + d.ans);
  turnText.textContent = d.nextTurn === mySid ? "✅ 轮到你提问" : "⏳ 等待对方提问";
})
socket.on("guessResult", d=>{
  if(d.right){
    if(d.winner === mySid){
      addChat("🎉！你猜对了，你获胜！对方是：" + d.secretName);
    }else{
      addChat("💥 对方猜对了，对方获胜！你是：" + d.secretName);
    }
  }else{
    addChat("❌ 猜测错误，你的猜测机会用完！对方是：" + d.secretName);
    guessLeft.textContent = "0";
  }
})
socket.on("markSync", d=>{
  myMark = d.mark;
  renderGrid(gameGrid, pool, false);
})
socket.on("msg", txt=>{
  tipMsg.textContent = txt;
  addChat(txt);
})
