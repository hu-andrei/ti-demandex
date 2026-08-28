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
- [ ] Confirmar que templates de sub-issue usam a categoria `Sub-issues`.
- [ ] Validar link do Project alterado.
- [ ] Validar contexto de Qualidade quando impactado.
- [ ] Verificar console do navegador.
- [ ] Testar painel de configurações.
- [ ] Testar persistência de preferências.
- [ ] Testar busca rápida com `Ctrl+K`.
- [ ] Testar favoritos e a atualização dos badges da equipe correspondente.
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
- [ ] Testar busca rápida e favoritos no ambiente publicado.
- [ ] Revisar artefato Lighthouse.
- [ ] Confirmar ausência de erros críticos no console.

## Em caso de falha após publicação

- [ ] Identificar o commit causador.
- [ ] Avaliar se a falha é de configuração, build ou frontend.
- [ ] Reverter ou corrigir via repositório-fonte.
- [ ] Publicar novamente pelo pipeline.
- [ ] Repetir a homologação.
- [ ] Registrar a ocorrência quando necessário.
