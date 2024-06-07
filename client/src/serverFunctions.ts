const server = "http://localhost:3000";

export async function getPlayerData(player: string): Promise<any> {
  const response = await fetch(`${server}/data/${player}`);
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}

export async function updatePlayerScore({
  player,
  win,
  loss,
  draw,
}: {
  player: string;
  win?: boolean;
  loss?: boolean;
  draw?: boolean;
}): Promise<any> {
  const response = await fetch(`${server}/data/${player}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ win, loss, draw }),
  });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}
