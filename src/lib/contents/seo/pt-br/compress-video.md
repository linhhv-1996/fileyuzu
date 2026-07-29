## O que é um Compressor de Vídeo?

O **Compressor de Vídeo** é uma ferramenta gratuita que funciona direto no navegador para reduzir o tamanho de arquivos de vídeo sem enviar seus dados para um servidor. Basta arrastar um vídeo, escolher a Otimização Automática (Auto Optimize) ou um tamanho alvo em MB e baixar o resultado comprimido — sem precisar fazer upload, sem criar conta e sem marca d'água.

Tudo roda localmente no seu aparelho usando a tecnologia WebAssembly, o que significa que uma gravação de tela de 500MB nunca sai do seu dispositivo. Isso o torna uma opção muito rápida e privada para comprimir vídeos, seja porque você precisa de um MP4 menor para enviar por e-mail, de um arquivo com tamanho específico para o Discord, ou apenas quer economizar espaço de armazenamento no celular ou PC sem perder a qualidade visual.

---

## O que "Sem Perda Visual" (Visually Lossless) Realmente Significa

A verdadeira compressão sem perdas (lossless) quase não diminui o tamanho do vídeo — o que a maioria das pessoas realmente procura é uma compressão *sem perda visual*: um arquivo mais leve que pareça idêntico ao original quando você assiste normalmente. Os formatos de vídeo modernos guardam muitos dados redundantes que não mudam em nada a imagem que você vê, e remover esses dados pode reduzir o tamanho do arquivo em 50% a 80%, dependendo da origem.

É exatamente com base nesse padrão que esta ferramenta foi construída: entregar um arquivo significativamente menor, sem que quem estiver assistindo consiga notar qualquer diferença.

---

## Otimização Automática vs. Tamanho de Arquivo Alvo

A ferramenta oferece duas maneiras de atingir o melhor resultado, dependendo da sua necessidade:

- **Otimização Automática (Auto Optimize)** — Ativada por padrão. Ela analisa o seu vídeo e aplica uma compressão sem perda visual automaticamente, sem que você precise configurar números. É a melhor opção quando você só quer diminuir o vídeo e não tem um limite de tamanho específico em mente.
- **Tamanho de Arquivo Alvo (Target File Size)** — Desative a Otimização Automática para digitar um tamanho exato em MB. A ferramenta faz o cálculo reverso a partir desse número para encontrar as configurações certas de compressão. Assim, você atinge ou fica abaixo do seu tamanho alvo logo na primeira tentativa, sem precisar ficar adivinhando configurações.

---

## Como Comprimir um Vídeo

1. Arraste e solte o seu arquivo de vídeo na ferramenta, ou clique para procurar no seu dispositivo.
2. Deixe a **Otimização Automática** ligada para obter um arquivo menor sem perder qualidade, ou desative-a e digite o tamanho alvo em MB.
3. Clique em comprimir. O processamento acontece direto no seu aparelho, então não há nenhuma etapa de upload ou carregamento para a internet.
4. Baixe o vídeo comprimido quando ele estiver pronto.

A maioria dos vídeos curtos fica pronta em menos de um minuto. Arquivos mais longos ou de resoluções muito altas levam um pouco mais de tempo, dependendo da potência do seu celular ou computador.

---

## Direto no Navegador: Sem Upload, Sem Servidor, Sem Espera

A grande maioria dos compressores de vídeo online faz o upload do seu arquivo para um servidor remoto antes de começar a trabalhar. Para vídeos grandes, só esse tempo de envio pode levar vários minutos, sem falar que seu vídeo fica salvo em servidores que você não controla. Nossa ferramenta pula essa etapa totalmente.

Como um **compressor de vídeo sem upload**, ele carrega o motor de compressão direto no seu navegador e processa o arquivo usando o processador (CPU) do seu próprio dispositivo. Não tem tempo de espera para enviar o arquivo, não consome sua internet e nenhuma cópia do seu vídeo fica armazenada em outro lugar — sendo a escolha mais segura como um **compressor de vídeo privado** para gravações de tela, vídeos de clientes ou conteúdos sigilosos.

Em nossos testes, um vídeo de 300MB foi comprimido em cerca de 30 segundos em um MacBook Air M3 (16GB) — e o tempo de upload foi zero, já que ele não existe. A velocidade real vai depender do hardware do seu aparelho, mas só o fato de pular a etapa de upload já remove o maior gargalo que as outras ferramentas online têm.

---

## Comprimir Vídeo para Discord, E-mail e Redes Sociais

Plataformas diferentes têm limites diferentes de tamanho de arquivo, e passar do limite por apenas 1 ou 2 MB significa ter que refazer todo o processo. Use o modo "Tamanho de Arquivo Alvo" com estas recomendações de tamanho:

- **Discord (conta grátis):** 8 MB (o limite oficial da plataforma é 10 MB)
- **Gmail / Outlook:** 24 MB
- **WhatsApp:** 15.5 MB
- **YouTube / Instagram / Facebook:** não têm limite rígido, mas vídeos menores fazem upload e são processados muito mais rápido.

Definir o seu alvo 1 ou 2 MB abaixo do limite oficial da plataforma evita aquele erro chato de o arquivo ser rejeitado mesmo parecendo pequeno o suficiente.

---

## Perguntas Frequentes (FAQ)

### Comprimir meu vídeo vai reduzir a qualidade da imagem?

Com a Otimização Automática ligada, não há perda que o olho humano perceba — a ferramenta foca em um resultado "sem perda visual". Já com o Tamanho de Arquivo Alvo, a qualidade vai depender de quão baixo é o número em MB que você digitou comparado à duração do vídeo. Colocar um limite muito pequeno para um vídeo longo vai resultar em uma perda de qualidade maior do que usar esse mesmo limite para um vídeo curtinho.

### É verdade que meu vídeo nunca é enviado para a internet?

Sim, é verdade. O motor de compressão roda 100% no seu navegador através do WebAssembly. O arquivo é lido, processado e salvo de volta no seu aparelho. Se quiser testar, você pode abrir a aba de "Rede" (Network) nas ferramentas de desenvolvedor do seu navegador enquanto comprime um vídeo — nenhuma requisição de envio de arquivo vai aparecer.

### Quais formatos de vídeo o compressor aceita?

Você pode enviar vídeos nos formatos MP4, MOV e WebM. O arquivo final entregue será em MP4, que é o formato mais universal e funciona perfeitamente em qualquer plataforma ou dispositivo.

### O modo de "Tamanho de Arquivo Alvo" é realmente preciso?

Ele foi programado para atingir o número exato que você digitou (ou ficar ligeiramente abaixo) logo na primeira tentativa, para que você não perca tempo refazendo o processo. Vale lembrar que se o vídeo original já for extremamente curto ou já estiver super comprimido, existe um limite mínimo real em que não é possível diminuir mais sem estragar a imagem.

### Funciona no celular?

Sim. Como a ferramenta funciona no navegador, não há aplicativo para baixar ou instalar. Basta acessar o site pelo celular, selecionar o vídeo e comprimir exatamente do mesmo jeito que você faria no computador. O tempo que vai demorar depende do processador do seu smartphone.
