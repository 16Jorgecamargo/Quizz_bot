const fs = require('fs');
const client = require('../clientStart');
const caminho = './src/data/alunos.json';

// Armazenamento das sessões
let sessoesCadastro = {};

exports.verificarCadastro = (numero) => {
  try {
    if (!fs.existsSync(caminho)) {
      fs.writeFileSync(caminho, JSON.stringify({}, null, 2));
    }

    const alunos = JSON.parse(fs.readFileSync(caminho, 'utf-8') || '{}');
    return alunos[numero] !== undefined && alunos[numero].nome && alunos[numero].serie && alunos[numero].escola;
  } catch (erro) {
    console.error('Erro ao verificar cadastro:', erro);
    return false;
  }
};

exports.iniciarCadastro = async (numero, mensagem) => {
  try {
    const alunos = JSON.parse(fs.readFileSync(caminho, 'utf-8') || '{}');
    const sessaoUsuario = sessoesCadastro[numero];

    // Se já existe uma sessão ativa para este número, continua o cadastro
    if (sessaoUsuario && sessaoUsuario.ativo) {
      // Atualiza atividade da sessão
      sessaoUsuario.ultimaAtividade = Date.now();

      // Processa as etapas do cadastro
      switch (sessaoUsuario.estagio) {
        case 0:
          alunos[numero].nome = mensagem.body;
          sessaoUsuario.estagio++;
          fs.writeFileSync(caminho, JSON.stringify(alunos, null, 2));
          await mensagem.reply('Qual é a sua série?');
          break;

        case 1:
          alunos[numero].serie = mensagem.body;
          sessaoUsuario.estagio++;
          fs.writeFileSync(caminho, JSON.stringify(alunos, null, 2));
          await mensagem.reply('Qual é o nome da sua escola?');
          break;

        case 2:
          alunos[numero].escola = mensagem.body;
          fs.writeFileSync(caminho, JSON.stringify(alunos, null, 2));
          await mensagem.reply('Cadastro concluído! para iniciar o quiz, envie *Iniciar*.');
          delete sessoesCadastro[numero];
          break;
      }
      return;
    }

    // Inicializa novo cadastro
    if (!alunos[numero]) {
      alunos[numero] = {
        nome: "",
        serie: "",
        escola: "",
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
      fs.writeFileSync(caminho, JSON.stringify(alunos, null, 2));

      // Cria nova sessão
      sessoesCadastro[numero] = {
        numero,
        estagio: 0,
        ativo: true,
        ultimaAtividade: Date.now()
      };

      await mensagem.reply('Bem vindo! vejo que você é novo aqui.');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await client.sendMessage(numero, 'Vamos começar o seu cadastro apenas pra mim me lembrar de você.');
      await new Promise(resolve => setTimeout(resolve, 1200));
      await client.sendMessage(numero, 'Qual é o seu nome?');
    }

  } catch (erro) {
    console.error('Erro ao processar cadastro:', erro);
    await mensagem.reply('Ocorreu um erro no cadastro. Por favor, tente novamente.');
    delete sessoesCadastro[numero];
  }
};

// Função auxiliar para limpar dados do usuário
const limparDadosUsuario = async (numero) => {
  try {
    const alunos = JSON.parse(fs.readFileSync(caminho, 'utf-8') || '{}');
    delete alunos[numero];
    fs.writeFileSync(caminho, JSON.stringify(alunos, null, 2));

    delete sessoesCadastro[numero];
    console.log(`Sessão do usuário ${numero} foi removida por inatividade`);
    await client.sendMessage(
      numero,
      'Parece que você não pode responder agora! Tente mais tarde.'
    );
  } catch (erro) {
    console.error('Erro ao limpar dados do usuário:', erro);
  }
};

// Limpa sessões inativas periodicamente
setInterval(() => {
  const agora = Date.now();
  Object.keys(sessoesCadastro).forEach(async (numero) => {
    if (sessoesCadastro[numero].ultimaAtividade < agora - 300000) { // 5 minutos timeout
      await limparDadosUsuario(numero);
    }
  });
}, 60000); // Verifica a cada minuto