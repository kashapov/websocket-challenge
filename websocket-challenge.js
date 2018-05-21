document.forms.publish.onsubmit = function() {
  const ws = new WebSocket('ws://wsc.2123.io/');

  ws.binaryType = 'arraybuffer';
  ws.onopen = () => {
    showMessage('WebSocket connection opened');
    ws.send(JSON.stringify({ "name":`${this.message.value}`, "command": "challenge accepted" }));
  }

  let answer;

  ws.onmessage = (e) => {
    answer = JSON.parse(e.data);
    showMessage(e.data);

    const token = answer.token;
    ws.send(JSON.stringify({ token: token, command: "arithmetic" }));
    ws.onmessage = (e) => {
      answer = JSON.parse(e.data);
      showMessage(e.data);

      const res = answer.task.values.reduce((prev, curr) => eval(`${prev}${answer.task.sign}${curr}`));
      ws.send(JSON.stringify({ "token": token, "command": "arithmetic", "answer": res }));
      ws.onmessage = (e) => {
        answer = JSON.parse(e.data);
        showMessage(e.data);

        ws.send(JSON.stringify({ token: token, command: "binary_arithmetic" }));
        ws.onmessage = (e) => {
          const ans = JSON.parse(e.data);
          showMessage(e.data);
          ws.onmessage = (e) => {
            answer = e.data;
            showMessage(e.data);

            let arr;
            if (ans.task.bits === 16) arr = new Uint16Array(answer);
            else arr = new Uint8Array(answer);

            const res2 = arr.reduce((prev, curr) => prev + curr);
            ws.send(JSON.stringify({ "token": token, "command": "binary_arithmetic", "answer": res2 }));
            ws.onmessage = (e) => {
              ws.send(JSON.stringify({ token: token, command: "win" }));
              ws.onmessage = (e) => {
                showMessage(e.data);
                ws.close();
                showMessage('WebSocket connection closed');
              }
            }
          }
        }
      }
    }
  }

  return false;
};

function showMessage(message) {
  var messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}
