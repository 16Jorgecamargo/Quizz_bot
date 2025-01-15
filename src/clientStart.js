const { Client, LocalAuth, Poll } = require('whatsapp-web.js');

const qrcode = require("qrcode-terminal")
const chalk = require('chalk')

const client = new Client({
	authStrategy: new LocalAuth({
		puppeteer: {
			args: ["--disable-accelerated-2d-canvas",
				"--disable-background-timer-throttling",
				"--disable-backgrounding-occluded-windows",
				"--disable-breakpad",
				"--disable-cache",
				"--disable-component-extensions-with-background-pages",
				"--disable-crash-reporter",
				"--disable-dev-shm-usage",
				"--disable-extensions",
				"--disable-gpu",
				"--disable-hang-monitor",
				"--disable-ipc-flooding-protection",
				"--disable-mojo-local-storage",
				"--disable-notifications",
				"--disable-popup-blocking",
				"--disable-print-preview",
				"--disable-prompt-on-repost",
				"--disable-renderer-backgrounding",
				"--disable-software-rasterizer",
				"--ignore-certificate-errors",
				"--log-level=3",
				"--no-default-browser-check",
				"--no-first-run",
				"--no-sandbox",
				"--no-zygote",
				"--renderer-process-limit=100",
				"--enable-gpu-rasterization",
				"--enable-zero-copy"],
			headless: false,
		},
		clientId: "locbot",
	})
})

client.on("qr", (qr) => {
	qrcode.generate(qr, { small: true })
})

client.on("auth_failure", (msg) => {
	console.error(chalk.red("Autenticação Falhou"), msg)
})

client.on("disconnected", (reason) => {
	console.log(chalk.red("Cliente Foi Desconectado", reason))
})

client.on('loading_screen', (percent, message) => {
	console.log(chalk.yellow('Programa Iniciando: ', percent, message));
})

client.on("ready", () => {
	console.log(chalk.green("Programa On-line"))
});

client.initialize();

module.exports = client;