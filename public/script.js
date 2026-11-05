const socket = io();
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

let roomId = "";
let isOwner = false;
let playerPool = [];
let myTarget = null;
let waitingAnswer = false;
let myGuessUsed = false;

function page(name) {
  $("#page-home").classList.add("hide");
  $("#page-lobby").classList.add("hide");
  $("#page-pick").classList.add("hide");
  $("#page-game").classList.add("hide");
  $(`#page-${name}`).classList.remove("hide");
}
function tip(el, txt, type="") {
  el.innerText = txt;
  el.className = type;
}
function renderGrid(container, list, stateMap={}) {
  container.innerHTML = "";
  list.forEach(name=>{
    const d = document.createElement("div");
    d.className = "item-card";
    d.innerText = name;
    if(stateMap[name]==="cross") d.classList.add("cross");
    if(stateMap[name]==="ques") d.classList.add("ques");
    container.appendChild(d);
  })
}

// 创建房间
$("#btnCreate").onclick = ()=>{
  const rid = $("#crid").value.trim();
  const pwd = $("#cpwd").value.trim();
  const diff = $("input[name=df]:checked").value;
  if(!rid || !pwd) return tip($("#homeTip"), "房间号、密码不能为空", "err");
  socket.emit("create_room", {roomId:rid, pwd, diff});
}
$("#btnJoin").onclick = ()=>{
  const rid = $("#jrid").value.trim();
  const pwd = $("#jpwd").value.trim();
  if(!rid || !pwd) return tip($("#homeTip"), "房间号、密码不能为空", "err");
  socket.emit("join_room", {roomId:rid, pwd});
}
$("#back1").onclick = ()=>location.reload();
$("#back2").onclick = ()=>location.reload();
$("#back3").onclick = ()=>location.reload();
$("#btnStart").onclick = ()=>socket.emit("start_game", roomId);
$("#btnRestart").onclick = ()=>socket.emit("restart_room", roomId);

// 选选手页面
$("#pickGrid").onclick = (e)=>{
  const item = e.target.closest(".item-card");
  if(!item) return;
  myTarget = item.innerText;
  socket.emit("pick_target", {roomId, name:myTarget});
  tip($("#pickTip"), `✅ 你选定：${myTarget}，等待对方`, "ok");
}

// 提问
$("#btnAsk").onclick = ()=>{
  const q = $("#askInput").value.trim();
  if(!q) return;
  socket.emit("ask_question", {roomId, q});
  $("#askInput").value = "";
  waitingAnswer = true;
  $("#ansZone").classList.remove("hide");
}
$$(".ansBtn").forEach(btn=>{
  btn.onclick = ()=>{
    const ans = btn.dataset.val;
    socket.emit("reply_answer", {roomId, ans});
    $("#ansZone").classList.add("hide");
    waitingAnswer = false;
  }
})

// 猜测
$("#btnGuess").onclick = ()=>{
  if(myGuessUsed) return tip($("#gameTip"), "你已经用过猜测机会！", "err");
  const g = $("#guessInput").value.trim();
  if(!g) return;
  myGuessUsed = true;
  socket.emit("make_guess", {roomId, guessName:g});
  $("#guessInput").value = "";
}

// 点击标记格子
let markState = {};
$("#gameGrid").addEventListener("click", e=>{
  const item = e.target.closest(".item-card");
  if(!item) return;
  const name = item.innerText;
  if(markState[name]==="cross") delete markState[name];
  else markState[name] = "cross";
  renderGrid($("#gameGrid"), playerPool, markState);
})
$("#gameGrid").addEventListener("dblclick", e=>{
  e.preventDefault();
  const item = e.target.closest(".item-card");
  if(!item) return;
  const name = item.innerText;
  if(markState[name]==="ques") delete markState[name];
  else markState[name] = "ques";
  renderGrid($("#gameGrid"), playerPool, markState);
})

// socket 事件
socket.on("msg", d=>{
  if($("#homeTip").offsetParent) tip($("#homeTip"), d.text, d.type);
  else if($("#pickTip").offsetParent) tip($("#pickTip"), d.text, d.type);
  else tip($("#gameTip"), d.text, d.type);
})
socket.on("enter_lobby", d=>{
  roomId = d.roomId;
  isOwner = d.isOwner;
  $("#lrid").innerText = roomId;
  $("#lcount").innerText = "1";
  if(isOwner) $(".ownerBtn").classList.add("show");
  page("lobby");
})
socket.on("room_refresh", d=>{
  $("#lcount").innerText = d.count;
})
socket.on("game_begin", d=>{
  playerPool = d.pool;
  renderGrid($("#pickGrid"), playerPool);
  page("pick");
})
socket.on("all_selected", d=>{
  markState = {};
  renderGrid($("#gameGrid"), playerPool, markState);
  page("game");
})
socket.on("new_question", d=>{
  const p = document.createElement("p");
  p.innerText = `对方提问：${d.text}`;
  $("#chatLog").appendChild(p);
  $("#turnHint").innerText = "轮到对方回答";
})
socket.on("answer_result", d=>{
  const p = document.createElement("p");
  p.innerText = `对方回答：${d.ans}`;
  $("#chatLog").appendChild(p);
  $("#turnHint").innerText = "轮到你提问";
})
socket.on("game_win", d=>{
  $("#turnHint").innerText = `🎉 ${d.winner===socket.id?"你赢啦！":"对方猜对了！"} 目标选手：${d.target}`;
})
socket.on("guess_wrong", d=>{
  $("#turnHint").innerText = d.loser===socket.id ? "❌ 你猜错了，你的猜测机会用完！" : "对方猜错了！";
})
socket.on("reset_game", ()=>{
  myGuessUsed = false;
  myTarget = null;
  markState = {};
  $("#chatLog").innerHTML = "";
  page("pick");
})
