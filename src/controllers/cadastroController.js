const fs = require('fs');
const client = require('../clientStart');
const path = './src/data/alunos.json';

exports.verificarCadastro = (numero) => {
  try {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({}, null, 2));
    }

    const alunos = JSON.parse(fs.readFileSync(path, 'utf-8') || '{}');
    return alunos[numero] !== undefined && alunos[numero].nome && alunos[numero].serie && alunos[numero].escola;
  } catch (error) {
    console.error('Erro ao verificar cadastro:', error);
    return false;
  }
};

exports.iniciarCadastro = async (numero, mensagem) => {
  try {
    const alunos = JSON.parse(fs.readFileSync(path, 'utf-8') || '{}');
    if (!alunos[numero]) {
      alunos[numero] = {
        nome: "",
        serie: "",
        escola: "",
        cadastroEmAndamento: true,
        quiz: {
          totalAcertos: 0,
          totalErros: 0,
          ultimaPerguntaCorreta: 0,
          totalPerguntasRespondidas: 0,
          recordeTotal: 0,
          pontuacaoAtual: {
            acertos: 0,
            erros: 0,
            totalPerguntas: 0
          }
        }
      };
      fs.writeFileSync(path, JSON.stringify(alunos, null, 2));
      await mensagem.reply('Bem vindo! vejo que você é novo aqui.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await client.sendMessage(numero, 'Vamos começar o seu cadastro apenas pra mim me lembrar de você.');
      await new Promise(resolve => setTimeout(resolve, 1200));
      await client.sendMessage(numero, 'Qual é o seu nome?');
      return;
    }

    // Se já está em cadastro, processa as respostas
    if (alunos[numero].cadastroEmAndamento) {
      if (!alunos[numero].nome) {
        alunos[numero].nome = mensagem.body;
        fs.writeFileSync(path, JSON.stringify(alunos, null, 2));
        await mensagem.reply('Qual é a sua série?');
        return;
      }

      if (!alunos[numero].serie) {
        alunos[numero].serie = mensagem.body;
        fs.writeFileSync(path, JSON.stringify(alunos, null, 2));
        await mensagem.reply('Qual é o nome da sua escola?');
        return;
      }

      if (!alunos[numero].escola) {
        alunos[numero].escola = mensagem.body;
        alunos[numero].cadastroEmAndamento = false; 
        fs.writeFileSync(path, JSON.stringify(alunos, null, 2));
        await mensagem.reply('Cadastro concluído! para iniciar o quiz, envie *Iniciar*.');
        return;
      }
    }
  } catch (error) {
    console.error('Erro ao processar cadastro:', error);
    await mensagem.reply('Ocorreu um erro no cadastro. Por favor, tente novamente.');
  }
};