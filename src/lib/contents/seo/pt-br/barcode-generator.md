## Criar Código de Barras Online Direto no Navegador

Este gerador de código de barras gratuito cria imagens escaneáveis diretamente no seu navegador. Digite um código, envie uma planilha ou gere uma série numerada completa — e então baixe seus códigos de barras em PNG ou SVG.

Tudo roda localmente no seu dispositivo. Seus SKUs, números de série, IDs de patrimônio e dados de produtos nunca são enviados para um servidor. Para trabalhar com códigos de barras, isso importa mais do que você imagina: os valores que você codifica geralmente são dados internos da empresa — códigos de produtos não lançados, localizações no estoque, listas de inventário de clientes — e não há motivo para que esses dados fiquem no servidor de terceiros apenas para gerar uma imagem.

Sem cadastro, sem marca d'água, sem instalação.

---

## Três Maneiras de Gerar Códigos de Barras

A ferramenta possui três modos, dependendo de quantos códigos você precisa e de onde seus dados estão.

### Modo Manual: Um Código de Barras por Vez

Digite ou cole um valor, escolha o tipo de código de barras e ele aparecerá instantaneamente. Adicione uma legenda opcional legível abaixo dele e baixe em PNG ou SVG.

O modo manual é a opção mais rápida quando você precisa de um único código de barras — uma etiqueta de patrimônio rápida, uma etiqueta de teste, um código de produto ou um QR Code para um link.

### Modo Upload: Códigos de Barras em Massa via Excel ou CSV

Se os seus códigos já estão em uma planilha, não os digite novamente. Faça o upload de um arquivo Excel ou CSV e a ferramenta gerará o lote inteiro de uma só vez.

O formato do arquivo é simples:


| Coluna   | Objetivo       | Exemplo                 |
| :--- | :--- | :--- |
| Coluna A | Valor do código de barras | `SKU-001`               |
| Coluna B | Legenda opcional | `Camiseta Azul - Média` |


A Coluna A é o que o leitor escaneia. A Coluna B é o texto impresso sob o código para que as pessoas também possam identificar o item. Sua planilha é processada localmente no seu navegador — o arquivo nunca sai do seu dispositivo.

Este modo foi feito para listas de inventário, catálogos de produtos, registros de patrimônio e listas de crachás de eventos.

### Modo Sequencial: Séries Numeradas em Segundos

Precisa de `INV-2026-001` até `INV-2026-500`? O modo sequencial gera uma série ordenada automaticamente. Defina um prefixo, um número inicial e uma quantidade — a ferramenta cria toda a sequência sem que você precise tocar em uma planilha.

Esta é a maneira mais rápida de produzir:

* etiquetas para caixas de armazenamento e prateleiras
* etiquetas de patrimônio numeradas
* números de ingressos ou crachás
* números de pedidos e lotes
* códigos de prateleira e localização

A maioria das ferramentas de código de barras exige que você crie sequências no Excel primeiro. Aqui, a numeração é integrada.

---

## Tipos de Códigos de Barras Suportados

O gerador suporta os formatos de código de barras 1D e 2D mais utilizados:

| Tipo de Código de Barras | Melhor Para                                                     |
| :----------- | :-------------------------------------------------------------- |
| Code 128     | SKUs, inventário, etiquetas de patrimônio, números de série, etiquetas internas |
| UPC-A        | Produtos de varejo nos EUA e Canadá (12 dígitos)                |
| EAN-13       | Produtos de varejo vendidos internacionalmente (13 dígitos)      |
| EAN-8        | Itens de varejo pequenos com espaço limitado na etiqueta (8 dígitos) |
| ITF-14       | Caixas de envio e embalagens externas (14 dígitos)              |
| QR Code      | URLs, textos, credenciais de Wi-Fi, contatos, escaneamento móvel|

### Qual tipo de código de barras você deve escolher?

**Para uso interno** — inventário, prateleiras de estoque, rastreamento de patrimônio, crachás de funcionários — use o **Code 128**. Ele codifica letras, números e símbolos comuns, para que códigos como `PATRIMONIO-NOTE-024` funcionem sem restrições.

**Para produtos de varejo**, o formato depende de onde você vende: **UPC-A** para os EUA e Canadá, **EAN-13** para mercados internacionais (incluindo o Brasil) e **EAN-8** para embalagens muito pequenas. Note que esses formatos exigem números de produtos válidos — mais sobre isso abaixo.

**Para caixas de envio e fardos**, use o **ITF-14**. Ele codifica um GTIN de 14 dígitos e é projetado para papelão ondulado, onde um código de barras de varejo padrão geralmente tem uma impressão ruim.

**Para qualquer coisa escaneada com um celular** — links, cardápios, instruções, check-ins — use um **QR Code**.

---

## Baixar em PNG ou SVG

Cada código de barras pode ser exportado em dois formatos:

* **PNG** — uma imagem pronta para uso em documentos do Word, modelos de etiquetas, softwares de impressão térmica, planilhas e impressões rápidas.
* **SVG** — um arquivo vetorial que pode ser redimensionado sem perder a qualidade, ideal para embalagens de produtos, layouts no Illustrator ou Figma, e uso por designers.

Como regra geral: PNG para etiquetas e documentos de escritório, SVG para embalagens e trabalhos de design.

---

## Imprimindo seus Códigos de Barras

Um código de barras que parece perfeito na tela ainda pode falhar no leitor se for impresso muito pequeno, esticado ou cortado. Antes de imprimir um lote completo:

1. Mantenha a proporção travada ao redimensionar — nunca estique a largura ou a altura de forma independente.
2. Preserve a zona de silêncio (a margem em branco ao redor das barras).
3. Imprima barras pretas em um fundo branco fosco para obter o máximo de contraste.
4. Imprima uma amostra e faça um teste de leitura antes de rodar o lote inteiro.

---

## Importante: Imagens de Código de Barras vs. Números Oficiais de Produtos

Esta ferramenta cria a **imagem** do código de barras. Ela não emite números oficiais de produtos de varejo.

Para etiquetas internas — SKUs, patrimônio, códigos de armazém — você pode inventar os valores que quiser e codificá-los com o Code 128. É exatamente para isso que servem os códigos de barras internos.

Mas se você estiver vendendo produtos em lojas físicas ou marketplaces, seu número UPC ou EAN deve ser um identificador oficial registrado para a sua empresa. Uma imagem gerada de um número não registrado continua sendo um número não registrado.

---

## Perguntas Frequentes

### Este gerador de código de barras é realmente gratuito?

Sim. Todos os três modos — manual, upload de arquivo e sequencial — são gratuitos, sem necessidade de cadastro, sem marca d'água e sem limite de downloads.

### Meus dados são enviados para um servidor?

Não. Os códigos de barras são gerados localmente no seu navegador. Arquivos Excel e CSV enviados também são processados no seu dispositivo e nunca são transmitidos.

### Posso criar vários códigos de barras de uma só vez?

Sim. Use o modo Upload para gerar códigos de barras em massa a partir de um arquivo Excel ou CSV, ou o modo Sequencial para criar uma série numerada automaticamente.

### Posso usar isso para criar um código de barras UPC ou EAN para o meu produto?

Sim, se você já possui um número UPC ou EAN válido. A ferramenta cria a imagem escaneável, mas não registra identificadores oficiais de produtos. Para vendas no varejo, obtenha os números oficiais primeiro.

### Qual tipo de código de barras devo usar para etiquetas de estoque?

Code 128. Ele suporta letras, números e símbolos, o que o torna o formato mais flexível para SKUs, números de série e etiquetas de patrimônio.

### Devo baixar em PNG ou SVG?

PNG para modelos de etiquetas, documentos de escritório e impressão térmica. SVG para artes de embalagens e softwares de design, já que ele pode ser redimensionado sem perder qualidade.

### Os códigos de barras farão a leitura corretamente quando impressos?

Sim, desde que sejam impressos de forma nítida: tamanho correto, proporção travada, alto contraste e uma zona de silêncio intacta. Sempre faça um teste de leitura em uma amostra primeiro.
