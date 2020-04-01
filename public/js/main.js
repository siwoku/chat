const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const userRoom = document.getElementById("room-name");
const userList = document.getElementById("users");
console.log(userRoom);
//Get username aand room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on("message", msg => {
  outputMessage(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
//Join
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomUsers", ({ room, users }) => {
  console.log(users, room);
  outputRoom(room);
  outputusers(users);
});

//message submit
chatForm.addEventListener("submit", e => {
  e.preventDefault();

  //get an element by it value
  const msg = e.target.elements.msg.value;

  //emit messgae to the server
  socket.emit("replies", msg);

  //clear the input field
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoom(value) {
  userRoom.innerText = value;
}

//Get user list
function outputusers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
    `;
}
