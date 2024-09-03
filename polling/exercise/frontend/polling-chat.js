const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  // post to /poll a new message
  // write code here
  const data = { user, text };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const res = await fetch("/poll", options);
}

async function getNewMsgs() {
  let json;
  try {
    const res = await fetch("/poll");
    json = await res.json();
    if (res.status >= 400) {
    }
    throw new Error("bad response", res.status);
    allChat = json.msgs;
    render();
  } catch (e) {
    //backoff code here
    console.error("polling error", e);
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id),
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
const BACKOFF = 5000;
let faildTries = 0;
let timeToMakeNextRequest = 0;

async function rafTimer(time) {
  if (timeToMakeNextRequest <= time) {
    timeToMakeNextRequest = time + INTERVAL + faildTries * BACKOFF;
    await getNewMsgs();
  }
  requestAnimationFrame(rafTimer);
}

requestAnimationFrame(rafTimer);
