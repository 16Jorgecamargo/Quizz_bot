const fs = require('fs');
const { Poll } = require('whatsapp-web.js');
const pathPerguntas = './src/data/perguntas.json';
const pathAlunos = './src/data/alunos.json';

let sessoesQuiz = {};

exports.iniciarQuiz = async (client, numero, mensagem) => {
  try {
    console.log('Iniciando quiz para número:', numero);

    const sessaoExistente = Object.values(sessoesQuiz).find(sessao => 
      sessao.ativo && sessao.ultimaAtividade > Date.now() - TEMPO_LIMITE_SESSAO
    );

    if (sessaoExistente && sessaoExistente.numero !== numero) {
      await client.sendMessage(numero, 'Desculpe, já existe um quiz em andamento. Por favor, tente novamente em alguns minutos.');
      return;
    }

    const perguntas = JSON.parse(fs.readFileSync(pathPerguntas, 'utf-8'));
    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));

    sessoesQuiz[numero] = {
      numero,
      ativo: true,
      ultimaAtividade: Date.now(),
      perguntaAtual: null
    };

    const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
    const enquete = new Poll(pergunta.pergunta, pergunta.alternativas);

    await client.sendMessage(numero, enquete);
    
    sessoesQuiz[numero].perguntaAtual = pergunta.respostaCorreta;
    alunos[numero].quiz.ultimaPerguntaCorreta = pergunta.respostaCorreta;
    
    fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
  } catch (erro) {
    console.error('Erro ao iniciar quiz:', erro);
  }
};

exports.processarVoto = async (client, voto) => {
  try {
    const numero = voto.voter;
    const opcaoSelecionada = voto.selectedOptions[0].localId;

    if (!sessoesQuiz[numero] || !sessoesQuiz[numero].ativo) {
      await client.sendMessage(numero, 'Sua sessão expirou. Por favor, inicie um novo quiz.');
      return;
    }

    sessoesQuiz[numero].ultimaAtividade = Date.now();

    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8') || '{}');

    if (alunos[numero]) {
      alunos[numero].quiz.pontuacaoAtual.totalPerguntas++;
      alunos[numero].quiz.totalPerguntasRespondidas = (alunos[numero].quiz.totalPerguntasRespondidas || 0) + 1;

      if (opcaoSelecionada === sessoesQuiz[numero].perguntaAtual) {
        await client.sendMessage(numero, '✅ Resposta correta! Parabéns!');
        alunos[numero].quiz.totalAcertos = (alunos[numero].quiz.totalAcertos || 0) + 1;
        alunos[numero].quiz.pontuacaoAtual.acertos++;
      } else {
        await client.sendMessage(numero, '❌ Resposta incorreta. Continue tentando!');
        alunos[numero].quiz.totalErros = (alunos[numero].quiz.totalErros || 0) + 1;
        alunos[numero].quiz.pontuacaoAtual.erros++;
      }

      fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
    }
  } catch (erro) {
    console.error('Erro ao processar voto:', erro);
  }
};

exports.encerrarQuiz = async (client, numero) => {
  try {
    if (!sessoesQuiz[numero]) {
      await client.sendMessage(numero, 'Não há um quiz em andamento.');
      return;
    }

    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));

    if (alunos[numero]) {
      const estatisticas = alunos[numero].quiz.pontuacaoAtual;
      let mensagem = `📊 RESULTADO DO QUIZ:\n\n` +
        `✨ Total de perguntas: *${estatisticas.totalPerguntas}*\n` +
        `✅ Acertos: *${estatisticas.acertos}*\n` +
        `❌ Erros: *${estatisticas.erros}*`;

      if (estatisticas.acertos > (alunos[numero].quiz.recordeTotal || 0)) {
        alunos[numero].quiz.recordeTotal = estatisticas.acertos;
        mensagem += `\n\n🏆 Novo recorde pessoal: *${estatisticas.acertos}* acertos!`;
      }

      alunos[numero].quiz.pontuacaoAtual = {
        acertos: 0,
        erros: 0,
        totalPerguntas: 0
      };

      delete sessoesQuiz[numero];

      fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
      await client.sendMessage(numero, mensagem);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await client.sendMessage(numero, `Envie *Lider* para ver o ranking dos melhores alunos.`);
      await client.sendMessage(numero, `Ou envie *iniciar* para começar um novo quiz.`);
    }
  } catch (erro) {
    console.error('Erro ao encerrar quiz:', erro);
  }
};

setInterval(() => {
  Object.keys(sessoesQuiz).forEach(async (numero) => {
    if (sessoesQuiz[numero].ultimaAtividade < Date.now() - 300000) {
      try {
        await client.sendMessage(numero, 'você demorou muito para responder! O quiz foi encerrado.');
        await exports.encerrarQuiz(require('../clientStart'), numero);
      } catch (erro) {
        console.error('Erro ao encerrar quiz por inatividade:', erro);
      }
    }
  });
}, 60000); 

exports.mostrarRanking = async (client, numero) => {
  try {
    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));
    const ranking = Object.values(alunos)
      .sort((a, b) => (b.quiz.recordeTotal || 0) - (a.quiz.recordeTotal || 0))
      .slice(0, 5);

    let mensagem = '🏆 *RANKING DOS 5 MELHORES ALUNOS*\n\n';
    
    ranking.forEach((aluno, index) => {
      mensagem += `${index + 1}º Lugar:\n` +
                 `👤 Nome: *${aluno.nome}*\n` +
                 `📚 Série: *${aluno.serie}*\n` +
                 `🏫 Escola: *${aluno.escola}*\n` +
                 `🎯 Recorde: *${aluno.quiz.recordeTotal || 0}* acertos\n\n`;
    });

    await client.sendMessage(numero, mensagem);
  } catch (error) {
    console.error('Erro ao mostrar ranking:', error);
  }
};

exports.recorde = async (client, numero) => {
  try {
    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));
    if (alunos[numero]) {
      const recorde = alunos[numero].quiz.recordeTotal || 0;
      await client.sendMessage(numero, `🏆 Seu recorde pessoal é de *${recorde}* acertos.`);
    }
  } catch (error) {
    console.error('Erro ao mostrar recorde:', error);
  }
}
