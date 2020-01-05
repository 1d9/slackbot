import * as fetch from "isomorphic-fetch";
import * as format from "date-format";

const DATA_URL = "http://api.tome.1d9.tech/sessions";

interface Session {
  id: string;
  title: string;
  startTime: number; // ms formatted
}

async function getData() {
  const res = await fetch(DATA_URL);
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}

function getFutureSessions(sessions: Session[]) {
  const currentTime = Date.now();
  return (
    sessions
      // find sessions at / after the current time
      .filter(x => currentTime <= x.startTime)
      // sort by ascending order (aka nearest one first)
      .sort((a, b) => a.startTime - b.startTime)
  );
}

function formatDate(raw: number) {
  const next = new Date(raw);
  const date = next.toDateString();
  const time = format("hh:mm", next);
  return `*${date}* at ${time}`;
}

function buildNextSessionMessage(sessions: Session[]) {
  const date = formatDate(sessions[0].startTime);
  let message = `Next session is *"${sessions[0].title}"*.\nIt is scheduled for ${date}`;
  if (sessions.length > 1) {
    message += `\n`;
    message += `There are ${sessions.length} scheduled sessions.`;
  }

  return message;
}

function buildNoSessionMessage() {
  return `No future sessions found!`;
}

getData()
  .then(x => {
    const futureSessions = getFutureSessions(x);
    if (futureSessions.length > 0) {
      console.log(buildNextSessionMessage(futureSessions));
    } else {
      console.log(buildNoSessionMessage());
    }
  })
  .catch(e => {
    throw new Error(e);
  });
