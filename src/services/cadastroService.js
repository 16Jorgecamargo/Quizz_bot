const fs = require('fs');
const path = './src/data/alunos.json';

exports.verificarCadastro = (numero) => {
  const alunos = JSON.parse(fs.readFileSync(path, 'utf-8'));
  return alunos[numero] || null;
};

exports.salvarCadastro = (numero, dados) => {
  const alunos = JSON.parse(fs.readFileSync(path, 'utf-8'));

  if (!alunos[numero]) {
    alunos[numero] = { ...dados, quiz: { acertos: 0, erros: 0, perguntasRespondidas: [] } };
    fs.writeFileSync(path, JSON.stringify(alunos, null, 2));
  }
};

exports.atualizarAluno = (numero, dadosAtualizados) => {
  const alunos = JSON.parse(fs.readFileSync(path, 'utf-8'));
  if (alunos[numero]) {
    alunos[numero] = { ...alunos[numero], ...dadosAtualizados };
    fs.writeFileSync(path, JSON.stringify(alunos, null, 2));
  }
};
