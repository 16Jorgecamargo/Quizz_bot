# 🎯 Quizz_Bot

Um bot educacional para WhatsApp que permite realizar quizes interativos com alunos, desenvolvido para facilitar o ensino e aprendizagem de forma divertida.

## 📋 Sobre o Projeto

O Quiz Bot é uma ferramenta educacional que permite professores aplicarem questionários através do WhatsApp. O bot gerencia cadastros de alunos, aplica perguntas, corrige respostas automaticamente e mantém um ranking dos melhores desempenhos.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **WhatsApp-Web.js** - Biblioteca para interação com WhatsApp
- **Puppeteer** - Automação de navegador
- **QRCode Terminal** - Geração de QR Code para autenticação
- **Chalk** - Estilização de logs no console

## ⚙️ Funcionalidades

- Sistema de cadastro de alunos (nome, série e escola)
- Quiz interativo com perguntas de múltipla escolha
- Correção automática das respostas
- Sistema de pontuação e recordes pessoais
- Ranking dos 5 melhores alunos
- Estatísticas de desempenho

## 📱 Comandos Disponíveis

- `Iniciar` - Começa um novo quiz
- `Parar` - Encerra o quiz atual e mostra resultados
- `Lider` - Exibe o ranking dos 5 melhores alunos
- `Recorde` - Mostra seu recorde pessoal

## 🛠️ Como Instalar

1. Clone o repositório:
```bash
git clone https://github.com/16Jorgecamargo/Quizz_bot.git
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o bot:
```bash
node index.js
```

4. Escaneie o QR Code que aparecerá no terminal com o WhatsApp do seu celular

## 🗂️ Estrutura do Projeto

```
index.js
src/
├── clientStart.js         # Configuração do cliente WhatsApp
├── controllers/          
│   ├── cadastroController.js    # Controle de cadastros
│   ├── mensagemController.js    # Processamento de mensagens
│   └── quizController.js        # Lógica do quiz
├── data/
│   ├── alunos.json              # Base de dados dos alunos
│   └── perguntas.json           # Banco de perguntas
└── services/
    ├── cadastroService.js       # Serviços de cadastro
    └── quizService.js           # Serviços do quiz
```

## 📄 Licença

Este projeto está sob a licença GNU General Public License v3.0. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Jorge Camargo

---

⌨️ com ❤️ por Jorge Camargo