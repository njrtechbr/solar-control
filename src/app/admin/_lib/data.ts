
import { z } from 'zod';

// Client Schemas
export const clientSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "O nome do cliente é obrigatório."),
  clientType: z.enum(["pessoa_fisica", "pessoa_juridica"], {
    required_error: "Selecione o tipo de cliente.",
  }),
  document: z.string().min(11, "CPF/CNPJ é obrigatório."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().min(5, "O endereço é obrigatório."),
  city: z.string().min(2, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
});
export type Client = z.infer<typeof clientSchema>;

// Static Zod enums for default values. In the UI, we'll use dynamic values from localStorage.
export const InstallationStatusEnum = z.enum(["Pendente", "Agendado", "Em Andamento", "Concluído", "Cancelado"]);
export const ProjectStatusEnum = z.enum(["Não Enviado", "Enviado para Análise", "Aprovado", "Reprovado"]);
export const HomologationStatusEnum = z.enum(["Pendente", "Aprovado", "Reprovado"]);

// Default status values for initialization
export const defaultStatusConfig = {
  installation: InstallationStatusEnum.options,
  project: ProjectStatusEnum.options,
  homologation: HomologationStatusEnum.options
};
export type StatusConfig = typeof defaultStatusConfig;
export type StatusCategory = keyof StatusConfig;


export const inverterSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  serialNumber: z.string().min(1, "Nº de série é obrigatório"),
  warranty: z.string().optional(),
  dataloggerId: z.string().optional(),
});
export type Inverter = z.infer<typeof inverterSchema>;

export const panelSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  power: z.coerce.number().positive("Potência deve ser positiva"),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
});
export type Panel = z.infer<typeof panelSchema>;

export const installationSchema = z.object({
  id: z.number().optional(),
  installationId: z.string().optional(),
  clientId: z.number({ required_error: "Selecione um cliente." }),
  clientName: z.string(), // Denormalized for easy display
  address: z.string().min(5, "O endereço é obrigatório."),
  city: z.string().min(2, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
  installationType: z.enum(["residencial", "comercial"], {
    required_error: "Selecione o tipo de instalação.",
  }),
  utilityCompany: z.string().min(2, "O nome da concessionária é obrigatório."),
  protocolNumber: z.string().optional(),
  protocolDate: z.string().optional(),
  
  inverters: z.array(inverterSchema).default([]),
  panels: z.array(panelSchema).default([]),
  
  projectStatus: z.string().default(ProjectStatusEnum.options[0]),
  homologationStatus: z.string().default(HomologationStatusEnum.options[0]),
  status: z.string().default(InstallationStatusEnum.options[0]),
  reportSubmitted: z.boolean().default(false),
  scheduledDate: z.string().optional(),
  events: z.array(z.object({
    id: z.string(),
    date: z.string(),
    type: z.string(),
    description: z.string(),
    attachments: z.array(z.object({ name: z.string(), dataUrl: z.string() })).optional(),
  })).default([]),
  documents: z.array(z.object({
    name: z.string(),
    dataUrl: z.string(),
    type: z.string(),
    date: z.string(),
  })).default([]),
  archived: z.boolean().default(false),
});

export type Installation = z.infer<typeof installationSchema>;

export const initialClients: Client[] = [
    {
      id: 1,
      name: "Condomínio Sol Nascente",
      clientType: "pessoa_juridica",
      document: "12.345.678/0001-99",
      email: "sindico@solnascente.com",
      phone: "19987654321",
      address: "Rua A, 123",
      city: "Campinas",
      state: "SP",
      zipCode: "13000-001"
    },
    {
      id: 2,
      name: "Maria Silva",
      clientType: "pessoa_fisica",
      document: "123.456.789-00",
      email: "maria.silva@email.com",
      phone: "11912345678",
      address: "Rua B, 456",
      city: "São Paulo",
      state: "SP",
      zipCode: "01000-002"
    },
    {
      id: 3,
      name: "Supermercado Economia",
      clientType: "pessoa_juridica",
      document: "98.765.432/0001-11",
      email: "contato@supereconomia.com",
      phone: "1933334444",
      address: "Av. C, 789",
      city: "Valinhos",
      state: "SP",
      zipCode: "13270-003"
    },
    {
      id: 4,
      name: "João Pereira",
      clientType: "pessoa_fisica",
      document: "987.654.321-99",
      email: "joao.pereira@email.com",
      phone: "11988887777",
      address: "Rua D, 101",
      city: "Jundiaí",
      state: "SP",
      zipCode: "13201-004"
    },
    {
      id: 5,
      name: "Oficina Mecânica Veloz",
      clientType: "pessoa_juridica",
      document: "11.222.333/0001-44",
      email: "veloz@oficina.com",
      phone: "19977776666",
      address: "Rua E, 202",
      city: "Indaiatuba",
      state: "SP",
      zipCode: "13330-005"
    }
];

export const initialInverters: Inverter[] = [
    { id: 'inv1', brand: "WEG", model: "SIW500H", serialNumber: "WEG123456", warranty: "5 anos", dataloggerId: "DTL9876" },
    { id: 'inv2', brand: "Hoymiles", model: "MI-1500", serialNumber: "HOY987654", warranty: "12 anos", dataloggerId: "DTU-W100" },
];

export const initialPanels: Panel[] = [
    { id: 'pan1', brand: "Jinko Solar", model: "Tiger Pro", power: 550, quantity: 40 },
    { id: 'pan2', brand: "Canadian Solar", model: "HiKu6", power: 545, quantity: 12 },
];


export const initialInstallations: Installation[] = [
    { 
      id: 1, 
      installationId: "INST-001",
      clientId: 1,
      clientName: "Condomínio Sol Nascente", 
      address: "Rua A, 123", 
      city: "Campinas", 
      state: "SP", 
      zipCode: "13000-001", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "987654321",
      protocolDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      inverters: [{ id: 'inv1', brand: "WEG", model: "SIW500H", serialNumber: "WEG123456", warranty: "5 anos", dataloggerId: "DTL9876" }],
      panels: [{ id: 'pan1', brand: "Jinko Solar", model: "Tiger Pro", power: 550, quantity: 40 }],
      projectStatus: "Aprovado",
      homologationStatus: "Pendente",
      status: "Agendado", 
      reportSubmitted: false, 
      scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(), 
      events: [
        { id: '1', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'Protocolo', description: 'Protocolo 987654321 aberto na CPFL.', attachments: []},
        { id: '2', date: new Date(Date.now() - 86400000 * 9).toISOString(), type: 'Projeto', description: 'Projeto enviado para análise da concessionária.', attachments: []},
        { id: '3', date: new Date(Date.now() - 86400000 * 4).toISOString(), type: 'Projeto', description: 'Projeto aprovado pela concessionária.', attachments: []},
        { id: '4', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Agendamento', description: 'Visita técnica agendada com o síndico para a próxima semana.', attachments: []}
      ], 
      documents: [
        { name: 'projeto_preliminar.pdf', dataUrl: '#', type: 'application/pdf', date: new Date(Date.now() - 86400000 * 9).toISOString() }
      ],
      archived: false
    },
    { 
      id: 2, 
      installationId: "INST-002",
      clientId: 2,
      clientName: "Maria Silva", 
      address: "Rua B, 456", 
      city: "São Paulo", 
      state: "SP", 
      zipCode: "01000-002", 
      installationType: "residencial", 
      utilityCompany: "Enel",
      protocolNumber: "123456789",
      protocolDate: new Date(Date.now() - 86400000 * 15).toISOString(),
      inverters: [{ id: 'inv2', brand: "Hoymiles", model: "MI-1500", serialNumber: "HOY987654", warranty: "12 anos", dataloggerId: "DTU-W100" }],
      panels: [{ id: 'pan2', brand: "Canadian Solar", model: "HiKu6", power: 545, quantity: 12 }],
      projectStatus: "Aprovado",
      homologationStatus: "Aprovado",
      status: "Concluído", 
      reportSubmitted: true, 
      events: [
        { id: '1', date: new Date(Date.now() - 86400000 * 15).toISOString(), type: 'Protocolo', description: 'Protocolo 123456789 aberto na Enel.', attachments: []},
        { id: '2', date: new Date(Date.now() - 86400000 * 14).toISOString(), type: 'Projeto', description: 'Projeto enviado para análise.', attachments: []},
        { id: '3', date: new Date(Date.now() - 86400000 * 8).toISOString(), type: 'Projeto', description: 'Projeto Aprovado.', attachments: []},
        { id: '4', date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Agendamento', description: 'Instalação agendada.', attachments: []},
        { id: '5', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Problema', description: 'Atraso na entrega do inversor. Resolvido com o fornecedor no mesmo dia.', attachments: [{ name: 'nota_fiscal_inversor.pdf', dataUrl: '#'}]},
        { id: '6', date: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'Conclusão', description: 'Instalação finalizada e comissionada com sucesso.', attachments: []},
        { id: '7', date: new Date(Date.now() - 86400000 * 0).toISOString(), type: 'Homologação', description: 'Instalação homologada pela concessionária.', attachments: []}
      ], 
      documents: [
         { name: 'art_assinada.pdf', dataUrl: '#', type: 'application/pdf', date: new Date(Date.now() - 86400000 * 14).toISOString() },
         { name: 'contrato_servico.pdf', dataUrl: '#', type: 'application/pdf', date: new Date(Date.now() - 86400000 * 16).toISOString() }
      ],
      archived: false
    },
    { 
      id: 3, 
      installationId: "INST-003",
      clientId: 3,
      clientName: "Supermercado Economia", 
      address: "Av. C, 789", 
      city: "Valinhos", 
      state: "SP", 
      zipCode: "13270-003", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "555555555",
      protocolDate: new Date(Date.now() - 86400000 * 12).toISOString(),
      inverters: [],
      panels: [],
      projectStatus: "Reprovado",
      homologationStatus: "Pendente",
      status: "Cancelado", 
      reportSubmitted: false, 
      events: [
        { id: '1', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'Nota', description: 'Cliente solicitou cancelamento por motivos financeiros. Arquivar.', attachments: []}
      ], 
      documents: [],
      archived: true,
    },
    { 
      id: 4, 
      installationId: "INST-004",
      clientId: 4,
      clientName: "João Pereira", 
      address: "Rua D, 101", 
      city: "Jundiaí", 
      state: "SP", 
      zipCode: "13201-004", 
      installationType: "residencial", 
      utilityCompany: "CPFL",
      protocolNumber: "",
      protocolDate: "",
      inverters: [],
      panels: [],
      projectStatus: "Não Enviado",
      homologationStatus: "Pendente",
      status: "Pendente", 
      reportSubmitted: false, 
      events: [], 
      documents: [],
      archived: false,
    },
    { 
      id: 5, 
      installationId: "INST-005",
      clientId: 5,
      clientName: "Oficina Mecânica Veloz", 
      address: "Rua E, 202", 
      city: "Indaiatuba", 
      state: "SP", 
      zipCode: "13330-005", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "333222111",
      protocolDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      inverters: [],
      panels: [],
      projectStatus: "Enviado para Análise",
      homologationStatus: "Pendente",
      status: "Pendente", 
      reportSubmitted: false, 
      events: [], 
      documents: [],
      archived: false,
    },
];

export const createSampleReport = () => {
  return {
      clientName: "Maria Silva",
      inverters: [{ id: 'inv1', brand: "Hoymiles", model: "MI-1500", serialNumber: "HOY987654-UPDATED", warranty: "12 anos", dataloggerId: "DTU-W100-UPDATED" }],
      panels: [{ id: 'pan1', brand: "Canadian Solar", model: "HiKu6", power: 545, quantity: 12 }],
      strings: [
          { voltage: 450, plates: 6 },
          { voltage: 452, plates: 6 },
      ],
      phase1Neutro: 220,
      phase2Neutro: 219,
      phase1phase2: 380,
      phaseTerra: 220,
      neutroTerra: 0.5,
      cableMeterToBreaker: "16mm",
      cableBreakerToInverter: "10mm",
      generalBreaker: "63A",
      inverterBreaker: "50A",
      dataloggerConnected: true,
      observations: "Instalação realizada com sucesso, sem intercorrências. Cliente orientado sobre o monitoramento pelo aplicativo.",
      photo_uploads: [
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Visão geral dos painéis solares no telhado." },
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Inversor instalado na parede da garagem." },
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Teste de goteiras após a instalação." },
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Fachada da residência." },
      ],
      installationVideo: null,
      installationVideoDataUrl: "",
  };
};
