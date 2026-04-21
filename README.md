# Estoque Atelie

Projeto reorganizado para ficar mais facil de manter e expandir.

## Estrutura

```text
estoque-atelie/
├── index.html
├── styles.css
├── app.js
└── apps-script/
    └── Code.gs
```

## O que cada parte faz

- `index.html`: interface principal do sistema
- `styles.css`: visual e responsividade
- `app.js`: logica do estoque no navegador
- `apps-script/Code.gs`: base para integracao com Google Apps Script e Google Sheets

## Como usar agora

1. Abra `estoque-atelie/index.html` no navegador.
2. Continue usando o sistema local normalmente.
3. Quando quiser evoluir para armazenamento em nuvem, use a pasta `apps-script`.

## Endpoint do Apps Script

O front-end esta apontando para o deployment:

`https://script.google.com/macros/s/AKfycbxotb3SBmovYRv01XL9hj2PMOcPb6f3YxtYk3UiO1uQ5xDvfCjlqrm_mdFijpqqzL64/exec`

Se voce publicar uma nova versao do Apps Script no futuro, basta atualizar essa URL em `app.js`.

## Observacao

Neste momento, o front-end continua funcionando localmente com `localStorage`.
O arquivo `Code.gs` foi preparado como base para a proxima etapa de integracao com Google Apps Script.
