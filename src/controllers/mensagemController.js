const cadastroController = require('./cadastroController');
const quizController = require('./quizController');

exports.processarMensagem = async (client, mensagem) => {
  const numero = mensagem.from;
  const msg = mensagem.body.toLowerCase();
  const chat = await mensagem.getChat();
  const cadastroCompleto = await cadastroController.verificarCadastro(numero);
  const [horas, minutos, segundos] = [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()];
  if (!mensagem.fromMe) {
    console.log(`[${horas}:${minutos}:${segundos}] `+'Mensagem recebida: [', mensagem.body + " ] de:", mensagem.from);
  } else {
    console.log(`[${horas}:${minutos}:${segundos}] `+'Mensagem enviada: [', mensagem.body + " ] para:", mensagem.to);
  }

  if (mensagem.fromMe && msg === '✅ resposta correta! parabéns!') {
    await chat.clearMessages();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.acertou(client, mensagem);
    return;
  }

  if (!mensagem.fromMe && cadastroCompleto) {
    await this.processarComando(client, mensagem, msg, chat);
    return;
  }

  if (!cadastroCompleto && !mensagem.fromMe) {
    await cadastroController.iniciarCadastro(numero, mensagem);
  }
};

exports.processarComando = async (client, mensagem, msg, chat) => {
  switch (msg) {
    case "parar":
      await quizController.encerrarQuiz(client, mensagem.from);
      await chat.clearMessages();
      break;
    case "lider":
    case "líder":
      await quizController.mostrarRanking(client, mensagem.from);
      await chat.clearMessages();
      break;
    case "iniciar":
      await quizController.iniciarQuiz(client, mensagem.from, mensagem);
      await client.interface.openChatWindow(mensagem.from);
      break;
    case "recorde":
      await quizController.recorde(client, mensagem.from);
      await chat.clearMessages();
      break;
    default:
      await client.sendMessage(mensagem.from, 'Olá de novo!. Para iniciar o quiz, envie *Iniciar*.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await client.sendMessage(mensagem.from, 'Para ver o ranking dos melhores alunos, envie *Lider*.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await client.sendMessage(mensagem.from, 'Para ver o seu recorde pessoal, envie *Recorde*.');

      break;
  }
};

exports.acertou = async (client, mensagem) => {
  const numero = mensagem.to;
  console.log('Enviando nova pergunta para:', numero);
  await quizController.iniciarQuiz(client, numero, mensagem);
  await client.interface.openChatWindow(numero);
  await client.sendMessage(numero, 'Envie *Parar* para encerrar o quiz.');
};
