# Checklist operacional

## Antes de alterar o catálogo

- [ ] Confirmar a necessidade com a equipe responsável.
- [ ] Validar nome do template ou URL de destino.
- [ ] Validar Project e view corretos.
- [ ] Confirmar permissões do público-alvo.

## Antes do commit

- [ ] Executar o portal localmente.
- [ ] Validar renderização das equipes.
- [ ] Validar visualizações grid, list e menu.
- [ ] Abrir pelo menos um template de cada contexto alterado.
- [ ] Validar link do Project alterado.
- [ ] Validar contexto de Qualidade quando impactado.
- [ ] Verificar console do navegador.
- [ ] Testar painel de configurações.
- [ ] Testar persistência de preferências.
- [ ] Testar com movimento reduzido quando houver alteração visual.
- [ ] Atualizar `VERSION` quando a política de versão exigir.
- [ ] Executar `make build`.
- [ ] Validar `dist/index.html`.

## Antes da publicação

- [ ] Revisar diff do código.
- [ ] Confirmar que não há credenciais ou dados sensíveis.
- [ ] Confirmar links externos.
- [ ] Confirmar versão.
- [ ] Confirmar documentação afetada.

## Após a publicação

- [ ] Confirmar workflow concluído com sucesso.
- [ ] Abrir o portal publicado.
- [ ] Conferir versão exibida.
- [ ] Testar formulário de Suporte.
- [ ] Testar formulário de BI.
- [ ] Testar formulário de Desenvolvimento.
- [ ] Testar formulário de RPA.
- [ ] Testar fluxo de Qualidade.
- [ ] Testar acesso aos Projects.
- [ ] Revisar artefato Lighthouse.
- [ ] Confirmar ausência de erros críticos no console.

## Em caso de falha após publicação

- [ ] Identificar o commit causador.
- [ ] Avaliar se a falha é de configuração, build ou frontend.
- [ ] Reverter ou corrigir via repositório-fonte.
- [ ] Publicar novamente pelo pipeline.
- [ ] Repetir a homologação.
- [ ] Registrar a ocorrência quando necessário.
