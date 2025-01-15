const client = require('./src/clientStart');
const mensagemController = require('./src/controllers/mensagemController');
const quizController = require('./src/controllers/quizController');

// Listener para mensagens recebidas
client.on('message_create', async (mensagem) => {
  if(mensagem.from === "status@broadcast") return;
  const adm = ["5545xxxxx0382@c.us", "55xxx9336916@c.us", "5545xxxxx0337@c.us"]; // Números que deseja que tenham acesso ao bot
  if (!adm.includes(mensagem.from)) return; 
  await mensagemController.processarMensagem(client, mensagem);
});

// Listener para atualização de votos
client.on('vote_update', async (vote) => {
  await quizController.processarVoto(client, vote);
});

