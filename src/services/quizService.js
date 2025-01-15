const fs = require('fs');
const pathPerguntas = './src/data/perguntas.json';
const pathAlunos = './src/data/alunos.json';

exports.obterPerguntaAleatoria = () => {
  const perguntas = JSON.parse(fs.readFileSync(pathPerguntas, 'utf-8'));
  return perguntas[Math.floor(Math.random() * perguntas.length)];
};

exports.registrarResposta = (numero, correta) => {
  const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));

  if (alunos[numero]) {
    if (correta) {
      alunos[numero].quiz.acertos = (alunos[numero].quiz.acertos || 0) + 1;
    } else {
      alunos[numero].quiz.erros = (alunos[numero].quiz.erros || 0) + 1;
    }
    fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
  }
};

exports.registrarPerguntaRespondida = (numero, pergunta, respostaCorreta) => {
  const alunos = JSON.parse(fs.readFileSync(pathAlunos, 'utf-8'));

  if (!alunos[numero].quiz.perguntasRespondidas) {
    alunos[numero].quiz.perguntasRespondidas = [];
  }

  alunos[numero].quiz.perguntasRespondidas.push({
    pergunta,
    respostaCorreta
  });

  fs.writeFileSync(pathAlunos, JSON.stringify(alunos, null, 2));
};
