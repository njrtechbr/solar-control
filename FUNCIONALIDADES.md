# Funcionalidades do Sistema - SolarView Pro

Este documento detalha todas as funcionalidades implementadas na plataforma SolarView Pro, divididas por cada uma de suas interfaces principais.

---

## 1. Painel Administrativo (`/admin`)

Interface completa para a equipe de back-office gerenciar todo o ciclo de vida das instalações.

### 1.1. Dashboards Kanban
- **Visão Unificada:** Quatro quadros Kanban distintos para acompanhar o progresso de:
  - **Instalações:** Status geral da instalação (Pendente, Agendado, Em Andamento, Concluído, etc.).
  - **Projetos:** Status do projeto técnico (Não Enviado, Em Análise, Aprovado, Reprovado).
  - **Homologação:** Status do processo junto à concessionária (Pendente, Aprovado, Reprovado).
  - **Relatórios:** Status de envio do relatório pelo técnico de campo (Enviado, Pendente).
- **Interatividade:** Arraste e solte (drag-and-drop) os cards de instalações entre as colunas para atualizar seu status de forma rápida e intuitiva.
- **Contadores Visuais:** Cada coluna exibe a contagem de quantos projetos estão naquele estágio.
- **Registro Automático:** Mover um card gera automaticamente um evento no histórico da instalação.

### 1.2. Gestão de Clientes (`/admin/clients`)
- **CRUD Completo:** Crie, visualize, edite e remova clientes.
- **Tabela Centralizada:** Visualize todos os clientes com busca por nome ou documento (CPF/CNPJ).
- **Formulário de Cadastro:** Adicione ou edite clientes com campos para Nome/Razão Social, Tipo (Pessoa Física/Jurídica), Documento, E-mail, Telefone e Endereço completo.
- **Vínculo com Instalações:** A tabela de clientes exibe um badge com o número de instalações associadas, funcionando como um link direto para a lista de projetos daquele cliente.

### 1.3. Gestão de Instalações (`/admin/installations`)
- **Criação Simplificada:** Inicie uma nova instalação associando-a a um cliente existente, definindo o tipo (residencial/comercial) e a concessionária.
- **Lista Completa:** Uma tabela exibe todas as instalações cadastradas, com filtros e ordenação.
- **Arquivamento:** Instalações concluídas ou canceladas podem ser arquivadas para manter a visão principal limpa, sem perder o histórico de dados.

### 1.4. Página de Detalhes da Instalação (`/admin/installation/[id]`)
- **Hub Central:** Uma página única que consolida todas as informações de um projeto.
- **Timeline Visual:** Acompanhe o progresso das 5 etapas principais (Protocolo, Projeto, Agendamento, Instalação, Homologação).
- **Gestão de Status:** Altere os status de Instalação, Projeto e Homologação através de menus de seleção.
- **Histórico de Eventos:** Timeline cronológica de todas as ações (mudanças de status, agendamentos, notas, etc.), com a possibilidade de adicionar eventos manuais com anexos.
- **Galeria de Mídias:** Visualize todas as fotos e documentos anexados ao projeto.
- **Dados do Relatório:** Acesse os dados brutos enviados pelo técnico de campo.
- **Geração de Relatório com IA:** Utilize a IA (Genkit) para gerar um relatório técnico consolidado e profissional com base nos dados enviados pelo instalador.

### 1.5. Agendamento e Calendário
- **Agendamento de Visitas:** Na página da instalação, agende a data e hora da visita técnica (habilitado após a aprovação do projeto).
- **Calendário Central (`/admin/calendar`):** Uma visão de calendário (mês, semana, dia) exibe todas as instalações agendadas, permitindo clicar em um evento para ir diretamente para a página de detalhes.

### 1.6. Gestão de Equipamentos (`/admin/equipment`)
- **Inventário Central:** Gerencie o estoque de equipamentos com abas separadas para Inversores e Painéis Solares.
- **CRUD de Equipamentos:** Cadastre, edite e remova equipamentos do inventário.
- **Alocação de Equipamentos:** Na página da instalação, aloque equipamentos disponíveis do inventário para um projeto específico.
- **Busca por Nº de Série (`/admin/equipment/search`):** Localize um inversor específico pelo número de série, veja em qual instalação ele está alocado e realize a transferência para outra instalação.

### 1.7. Configurações (`/admin/settings`)
- **Fluxos de Trabalho Personalizáveis:** Adicione, renomeie, reordene (com drag-and-drop) e exclua os estágios (status) dos Kanbans de Instalação, Projeto e Homologação para adaptar o sistema ao seu processo.

### 1.8. Impressão (`/admin/installation/[id]/print`)
- **Geração de Documentos Físicos:** Crie versões para impressão em formato A4 de:
  - **Ordem de Serviço:** Para o instalador, contendo dados do cliente, equipamentos e um QR Code para o formulário de campo.
  - **Comprovante do Cliente:** Para o cliente, com um resumo do processo e um QR Code para a página de acompanhamento.

---

## 2. Formulário do Instalador (`/`)

Interface web otimizada para dispositivos móveis, projetada para o técnico de campo.

- **Acesso Direto:** A URL pode receber o nome do cliente como parâmetro (`?client=NomeDoCliente`) para preencher o campo automaticamente.
- **Formulário Estruturado:** Um acordeão organiza o formulário em seções colapsáveis para garantir que nenhuma informação seja esquecida:
  - Informações do Cliente
  - Detalhes dos Equipamentos (inversor e painéis)
  - Medições de Strings (VCC)
  - Medições Elétricas (CA)
  - Componentes e Cabeamento
  - Documentação Fotográfica (upload de 12 fotos com anotações)
  - Verificação Final (incluindo upload de vídeo)
- **Validação de Dados:** Utiliza Zod para garantir que os dados inseridos sejam válidos.
- **Envio e Salvamento:** Ao enviar, o formulário completo é salvo como um JSON no `localStorage` do navegador e o status da instalação é atualizado no sistema principal para "Relatório Enviado".

---

## 3. Portal de Acompanhamento do Cliente (`/status/[id]`)

Página pública e simplificada para que o cliente final possa acompanhar o status de seu projeto.

- **Acesso por Link Único:** Cada instalação possui uma URL exclusiva e compartilhável.
- **Timeline Simplificada:** Exibe o progresso das 5 principais etapas do projeto com ícones visuais (concluído, em andamento, pendente, erro).
- **Lista de Atualizações:** Mostra os últimos 5 eventos públicos (excluindo "Notas Internas") para manter o cliente informado sobre o andamento.
- **Interface Limpa:** Projetada para ser clara e de fácil entendimento para usuários não técnicos.
