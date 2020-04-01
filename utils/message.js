const time = require("moment");

function formatMessages(username, text) {
  return {
    username,
    text,
    time: time().format("h:mm a")
  };
}

module.exports = formatMessages;
