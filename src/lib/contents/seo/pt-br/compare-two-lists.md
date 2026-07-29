## Como Comparar Duas Listas Online

Comparar duas listas visualmente deixa de funcionar lá pela vigésima linha. Esta ferramenta de comparação de listas faz isso de uma só vez, para listas de qualquer tamanho: cole seus dados, clique em comparar, e cada linha será categorizada para você — o que está faltando, o que é igual e o que está duplicado.

1. **Cole a Lista A** no campo da esquerda, um item por linha. Geralmente, esta é a sua lista base ou principal.
2. **Cole a Lista B** no campo da direita. Como alternativa, faça o upload de um arquivo em qualquer um dos campos — arquivos `.txt`, `.csv` e Excel (`.xlsx`) são todos suportados e lidos diretamente no seu navegador.
3. **Configure as opções.** Ative **Remover Espaços** (Trim Whitespace) se seus dados foram exportados do Excel, de um CRM ou banco de dados (espaços invisíveis no final são a principal causa de falsos erros de correspondência). Ative **Ignorar Maiúsculas/Minúsculas** (Ignore Case) se a capitalização for diferente entre as fontes.
4. **Clique em comparar** e abra a aba de resultados que responde à sua dúvida.

As linhas vazias são ignoradas automaticamente, para que você possa colar diretamente de uma coluna de planilha sem precisar limpar os dados antes.

---

## Entendendo os Resultados

A ferramenta funciona como um verificador de diferenças entre listas e removedor de duplicatas ao mesmo tempo. Cada comparação gera seis resultados:

- **Apenas na A** — itens presentes na Lista A, mas que faltam na Lista B.
- **Apenas na B** — itens presentes na Lista B, mas que faltam na Lista A.
- **Em Ambas** — a interseção: itens que aparecem nas duas listas.
- **Todas Únicas** — ambas as listas mescladas em uma só, com todas as duplicatas removidas.
- **Duplicatas A** — itens que aparecem mais de uma vez *dentro* da própria Lista A.
- **Duplicatas B** — a mesma verificação de duplicidade interna, mas para a Lista B.

Cada resultado é gerado em texto simples que você pode copiar direto de volta para uma planilha, uma importação de CRM ou um script.

---

## Para Que Serve Esta Ferramenta

**Comparar colunas de planilhas sem fórmulas.** O motivo mais comum para as pessoas usarem esta ferramenta é quando um PROCV (VLOOKUP) retorna `#N/D` para dados que parecem idênticos. Copie as duas colunas, cole aqui, ative "Remover Espaços" e a divergência será resolvida em segundos.

**Higiene e limpeza de listas de e-mail.** Faça o cruzamento de uma lista de contatos com a sua lista de exclusão (suppression list) antes de cada envio, mescle fontes de leads sem duplicatas ou encontre a sobreposição entre os segmentos de duas campanhas.

**Conciliação de IDs, SKUs e URLs.** Contagens de estoque em relação a registros de ERP, IDs de banco de dados migrados em relação à exportação de origem, URLs rastreadas em relação a um sitemap — qualquer trabalho onde a pergunta principal seja "o que está faltando?".

---

## O Que a Ferramenta Não Faz

Algumas limitações honestas, para que você não perca tempo com a ferramenta errada:

- **Duas listas de cada vez.** Não há comparação tripla. Para trabalhar com mais de duas fontes, compare o primeiro par, copie o resultado **Todas Únicas** e compare esse resultado mesclado com a sua terceira lista.
- **Linhas inteiras, não colunas dentro das linhas.** A comparação é feita linha por linha. Uma linha como `John Smith, john@exemplo.com` é tratada como um único texto — isole a coluna específica que você quer comparar antes de colar.
- **Apenas correspondência exata.** Após os ajustes opcionais de espaços e maiúsculas/minúsculas, os itens devem corresponder exatamente. Não há correspondência aproximada, então `Jon Smith` nunca será correspondente a `John Smith`.
- **A capacidade depende do seu dispositivo.** Como o processamento é local (no seu navegador), listas muito grandes são limitadas pela memória da sua máquina, e não pelos limites de um servidor. Dezenas de milhares de linhas não são problema para um computador comum.

---

## Perguntas Frequentes (FAQ)

### A comparação diferencia maiúsculas de minúsculas (case-sensitive)?

Por padrão, sim — `Maçã` e `maçã` são tratados como itens diferentes. Ative a opção **Ignorar Maiúsculas/Minúsculas** para tratá-los como iguais, o que geralmente é o ideal para endereços de e-mail e nomes.

### Posso comparar mais de duas listas ao mesmo tempo?

Não diretamente. Compare duas listas, copie o resultado **Todas Únicas** como sua nova base mesclada e, em seguida, faça uma segunda comparação com a terceira lista. Duas comparações em cadeia cobrem três fontes de dados.

### Qual é a diferença entre "Todas Únicas" e "Duplicatas A"?

"Todas Únicas" é o resultado definitivo que você guarda: ambas as listas mescladas e sem repetições — uma lista principal limpa. "Duplicatas A" é um aviso: mostra valores que se repetem dentro da própria Lista A, o que normalmente indica uma exportação com falhas que vale a pena corrigir antes de confiar no restante da comparação.

### A ordem dos meus itens importa?

Não. A ferramenta de comparação verifica apenas se cada item existe na outra lista, e não em qual posição ele está. Você não precisa organizar ou ordenar os dados de nenhuma das listas antes de colar.

### Por que itens que parecem idênticos aparecem como diferentes?

Quase sempre é por causa de um caractere invisível: um espaço no final, um espaço no início ou capitalização (letras maiúsculas/minúsculas) inconsistente de duas fontes de exportação diferentes. Ative **Remover Espaços** e **Ignorar Maiúsculas/Minúsculas** e faça a comparação novamente — isso resolve a grande maioria dos falsos erros de correspondência.
