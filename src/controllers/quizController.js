const fs = require('fs');
const { Poll } = require('whatsapp-web.js');
const pathPerguntas = './src/data/perguntas.json';
const pathAlunos = './src/data/alunos.json';

exports.iniciarQuiz = async (client, numero, mensagem) => {
  try {
    console.log('Iniciando quiz para número:', numero);
    const perguntas = JSON.parse(fs.readFileSync(pathPerguntas, 'utf-8'));
    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));

    const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
    const poll = new Poll(pergunta.pergunta, pergunta.alternativas);

    await client.sendMessage(numero, poll);
    alunos[numero].quiz.ultimaPerguntaCorreta = pergunta.respostaCorreta;
    fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
  } catch (error) {
    console.error('Erro ao iniciar quiz:', error);
  }
};

exports.processarVoto = async (client, vote) => {
  try {
    const numero = vote.voter;
    const voto = vote.selectedOptions[0].localId;
    if (voto === undefined) console.log('Voto removido');

    if (!fs.existsSync(pathAlunos)) {
      fs.writeFileSync(pathAlunos, JSON.stringify({}, null, 2));
    }

    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8') || '{}');

    if (alunos[numero]) {
      alunos[numero].quiz.pontuacaoAtual.totalPerguntas++;
      alunos[numero].quiz.totalPerguntasRespondidas = (alunos[numero].quiz.totalPerguntasRespondidas || 0) + 1;

      if (voto === alunos[numero].quiz.ultimaPerguntaCorreta) {
        client.sendMessage(numero, '✅ Resposta correta! Parabéns!');
        alunos[numero].quiz.totalAcertos = (alunos[numero].quiz.totalAcertos || 0) + 1;
        alunos[numero].quiz.pontuacaoAtual.acertos++;
      } else {
        client.sendMessage(numero, '❌ Resposta incorreta. Continue tentando!');
        alunos[numero].quiz.totalErros = (alunos[numero].quiz.totalErros || 0) + 1;
        alunos[numero].quiz.pontuacaoAtual.erros++;
      }

      fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
    }
  } catch (error) {
    console.error('Erro ao processar voto:', error);
  }
};

exports.encerrarQuiz = async (client, numero) => {
  try {
    const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));

    if (alunos[numero]) {
      const stats = alunos[numero].quiz.pontuacaoAtual;
      let mensagem = `📊 RESULTADO DO QUIZ:\n\n` +
        `✨ Total de perguntas: *${stats.totalPerguntas}*\n` +
        `✅ Acertos: *${stats.acertos}*\n` +
        `❌ Erros: *${stats.erros}*`;

      
      if (stats.acertos > (alunos[numero].quiz.recordeTotal || 0)) {
        alunos[numero].quiz.recordeTotal = stats.acertos;
        mensagem += `\n\n🏆 Novo recorde pessoal: *${stats.acertos}* acertos!`;
      }

      // Zera a pontuação atual
      alunos[numero].quiz.pontuacaoAtual = {
        acertos: 0,
        erros: 0,
        totalPerguntas: 0
      };

      fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
      await client.sendMessage(numero, mensagem);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await client.sendMessage(numero, `Envie *Lider* para ver o ranking dos melhores alunos.`);
      await client.sendMessage(numero, `Ou envie *iniciar* para começar um novo quiz.`);
    }
  } catch (error) {
    console.error('Erro ao encerrar quiz:', error);
  }
};

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
