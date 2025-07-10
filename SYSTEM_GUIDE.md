# Guia Técnico do Sistema - SolarView Pro

Este documento serve como um guia técnico completo para o desenvolvimento e manutenção da aplicação SolarView Pro.

## 1. Visão Geral da Arquitetura

O SolarView Pro é uma aplicação Next.js (com App Router) que utiliza React, TypeScript, ShadCN/UI para componentes e Tailwind CSS para estilização. O sistema é projetado para funcionar inteiramente no navegador do cliente, utilizando `localStorage` como sua base de dados principal.

### Principais Interfaces da Aplicação:
1.  **Formulário do Instalador (`/`)**: Uma página única e otimizada para dispositivos móveis onde os técnicos de campo submetem os relatórios de instalação.
2.  **Painel Administrativo (`/admin`)**: A área de gestão para a equipe interna (back-office), onde projetos, clientes e configurações são gerenciados.
3.  **Portal do Cliente (`/status/[id]`)**: Uma página pública de status para que o cliente final possa acompanhar o progresso de sua instalação.

### Stack Tecnológica:
-   **Framework:** Next.js 15 (App Router)
-   **Linguagem:** TypeScript
-   **UI Components:** ShadCN/UI, Radix UI
-   **Estilização:** Tailwind CSS
-   **Formulários:** React Hook Form com Zod para validação
-   **Drag-and-Drop (Kanban):** dnd-kit
-   **IA Generativa:** Genkit (para geração de relatórios)
-   **Armazenamento:** `localStorage` do navegador

## 2. Gerenciamento de Estado e Dados (localStorage)

A aplicação utiliza o `localStorage` como sua única fonte de verdade para persistência de dados. Toda a lógica de "banco de dados" opera sobre objetos JSON armazenados no navegador do usuário.

### Chaves Principais no `localStorage`:
-   `installations`: Um array de objetos `Installation`, representando todos os projetos. É a tabela central do sistema.
-   `clients`: Um array de objetos `Client`, representando a base de clientes.
-   `inverters`: Um array de objetos `Inverter`, representando o inventário central de inversores.
-   `panels`: Um array de objetos `Panel`, representando o inventário central de painéis solares.
-   `statusConfig`: Um objeto que armazena os arrays de status customizáveis para os quadros Kanban (`installation`, `project`, `homologation`).
-   `report_[clientName]`: Uma chave dinâmica para cada relatório enviado. Ex: `report_Maria Silva`. Armazena o JSON completo do formulário do instalador.

### Estrutura dos Dados (Schemas Zod):
A definição da estrutura de todos os dados está centralizada no arquivo `src/app/admin/_lib/data.ts`. Este arquivo exporta os schemas Zod (`clientSchema`, `installationSchema`, etc.) que servem como a "linguagem" para validar e tipar todos os dados da aplicação. **Qualquer modificação na estrutura de dados deve ser feita neste arquivo.**

## 3. Estrutura de Diretórios Detalhada

-   **`/` (raiz)**
    -   `page.tsx`: Renderiza o formulário do instalador. Acessa o nome do cliente via query param `?client=...`.
    -   `app/_components/installation-form.tsx`: O componente React que contém toda a lógica do formulário do instalador, incluindo validação e salvamento no `localStorage`.

-   **`/admin`**
    -   `layout.tsx`: O layout principal da área administrativa, que inclui o `AdminShell`.
    -   `page.tsx`: Redireciona para o dashboard padrão (`/admin/dashboard/installation`).
    -   `_components/`: Contém todos os componentes reutilizáveis da área de admin.
        -   `admin-shell.tsx`: O componente principal que provê a navegação lateral (sidebar) e o cabeçalho.
        -   `kanban-board.tsx`, `kanban-column.tsx`, `kanban-card.tsx`: Componentes que constroem os quadros Kanban interativos.
        -   `client-management.tsx`, `equipment-management.tsx`, etc.: Componentes de UI para gerenciar seções específicas.
    -   `_lib/data.ts`: **Arquivo crucial.** Define todos os schemas de dados (Zod), tipos TypeScript e os dados iniciais de exemplo.

-   **`/admin/dashboard/[[...slug]]/page.tsx`**
    -   Página dinâmica que renderiza os diferentes quadros Kanban com base no `slug` da URL (`installation`, `project`, etc.). Contém a lógica de arrastar e soltar (drag-and-drop) para atualização de status.

-   **`/admin/installation/[id]/page.tsx`**
    -   A página de detalhes de uma instalação. É o hub central que exibe a timeline, histórico de eventos, equipamentos alocados, e permite a geração de relatórios com IA.

-   **`/status/[id]/page.tsx`**
    -   A página pública de status para o cliente. Lê os dados de uma instalação específica do `localStorage` e os exibe em um formato simplificado.

-   **`/src/ai/flows`**
    -   `generate-report-flow.ts`: Contém o flow Genkit responsável por receber o JSON do relatório do instalador e gerar um texto técnico consolidado.

## 4. Padrões de Desenvolvimento e Boas Práticas

-   **Componentização:** A UI é construída com base em componentes reutilizáveis de `ShadCN/UI`. Componentes mais complexos são criados em `src/app/admin/_components`.
-   **Client-Side Rendering (`"use client"`)**: Como a aplicação depende inteiramente do `localStorage` e da interatividade do usuário, a maioria dos componentes e páginas são renderizados no lado do cliente.
-   **Hooks para Lógica de Estado:** A lógica de carregamento e salvamento de dados do `localStorage` é feita dentro de hooks `useEffect` e `useState` no nível da página ou componente principal.
-   **Validação com Zod:** Todos os formulários usam `react-hook-form` e o `zodResolver` para garantir que os dados inseridos correspondam aos schemas definidos em `data.ts`.
-   **Estilo Visual:**
    -   As cores primárias, de fundo e de destaque são definidas como variáveis CSS em `src/app/globals.css`. Use as classes do Tailwind (`bg-primary`, `text-accent`, etc.) em vez de cores hard-coded.
    -   A fonte principal é 'Inter'.
    -   Ícones são da biblioteca `lucide-react`.

## 5. Como Realizar Modificações

-   **Adicionar um novo campo a um formulário:**
    1.  Atualize o schema Zod correspondente em `src/app/admin/_lib/data.ts`.
    2.  Adicione o `FormField` no componente React do formulário (ex: `client-management.tsx`).
    3.  Se o campo for para exibição, adicione-o na `ColumnDef` da tabela correspondente (ex: `installation-table.tsx`).

-   **Criar uma nova página no Admin:**
    1.  Crie uma nova pasta em `/admin/sua-nova-pagina`.
    2.  Adicione um `page.tsx` dentro dela, importando os dados do `localStorage` com `useEffect`.
    3.  Adicione o link para a nova página no array `menuItems` em `src/app/admin/_components/admin-shell.tsx`.

-   **Modificar um Flow de IA:**
    1.  Edite o arquivo correspondente em `src/ai/flows`.
    2.  Ajuste o `prompt` e os schemas de entrada/saída (Zod) para refletir a nova lógica.
    3.  Atualize a chamada da função do flow no componente React que a utiliza (ex: a chamada de `generateFinalReport` em `/admin/installation/[id]/page.tsx`).
