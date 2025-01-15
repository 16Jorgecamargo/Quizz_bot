const client = require('./src/clientStart');
const mensagemController = require('./src/controllers/mensagemController');
const quizController = require('./src/controllers/quizController');

// Listener para mensagens recebidas
client.on('message_create', async (mensagem) => {
  /*const adm = ["554592xxxxx2@c.us", "551194xxxxxx@c.us"]; // Números que deseja que tenham acesso ao bot
  if (!adm.includes(mensagem.from)) return;  */
  await mensagemController.processarMensagem(client, mensagem);
});

// Listener para atualização de votos
client.on('vote_update', async (vote) => {
  await quizController.processarVoto(client, vote);
});


