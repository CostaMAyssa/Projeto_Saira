
export interface CampaignType {
  name: string;
  description: string;
  template: string;
  trigger: string;
  defaultConfig: Record<string, any>;
  variables: string[];
  targetAudience: Record<string, any>;
}

export const campaignTypes: Record<string, CampaignType> = {
  recompra: {
    name: 'Lembrete de Recompra',
    description: 'Notificar clientes sobre a necessidade de recompra de medicamentos de uso contínuo.',
    template: 'Olá {nome}, notamos que seu medicamento {medicamento} está próximo de acabar. Temos disponível para retirada na farmácia. Podemos separar para você?',
    trigger: 'recompra',
    defaultConfig: {
      check_interval_days: 7,
      advance_notice_days: 3,
      product_types: ['uso_continuo', 'controlado']
    },
    variables: ['nome', 'medicamento', 'ultima_compra'],
    targetAudience: {
      tags: ['uso_continuo'],
      product_categories: ['medicamentos']
    }
  },
  aniversario: {
    name: 'Aniversário',
    description: 'Mensagem de felicitação pelo aniversário com oferta especial.',
    template: 'Olá {nome}, a equipe da Farmácia Saíra deseja um Feliz Aniversário! Como presente, você tem 10% de desconto em qualquer produto hoje!',
    trigger: 'aniversario',
    defaultConfig: {
      execution_time: '09:00',
      discount_percentage: 10,
      valid_hours: 24
    },
    variables: ['nome', 'desconto', 'validade'],
    targetAudience: {
      all_clients: true
    }
  },
  posvenda: {
    name: 'Pós-venda',
    description: 'Acompanhamento após a venda de produtos específicos.',
    template: 'Olá {nome}, como foi a experiência com {produto} que adquiriu conosco? Estamos à disposição para qualquer dúvida ou orientação adicional.',
    trigger: 'posvenda',
    defaultConfig: {
      trigger_after_days: 3,
      product_categories: ['medicamentos', 'suplementos'],
      max_follow_ups: 2
    },
    variables: ['nome', 'produto', 'data_compra'],
    targetAudience: {
      recent_purchases: true
    }
  },
  reativacao: {
    name: 'Reativação',
    description: 'Campanha para reconectar com clientes inativos.',
    template: 'Olá {nome}, sentimos sua falta! Faz algum tempo que não nos visita e preparamos ofertas especiais para você. Venha conferir!',
    trigger: 'reativacao',
    defaultConfig: {
      inactive_days: 30,
      execution_frequency: 'weekly',
      special_offers: true
    },
    variables: ['nome', 'dias_inativo', 'ofertas'],
    targetAudience: {
      inactive_clients: true
    }
  },
  promocao: {
    name: 'Promoção',
    description: 'Divulgação de ofertas e promoções para clientes específicos.',
    template: 'Olá {nome}, temos uma oferta especial para você! {produto} com até 20% de desconto até o fim de semana. Aproveite!',
    trigger: 'promocao',
    defaultConfig: {
      discount_percentage: 20,
      duration_days: 3,
      target_products: [],
      min_purchase_amount: 0
    },
    variables: ['nome', 'produto', 'desconto', 'validade'],
    targetAudience: {
      tags: ['VIP', 'Ocasional']
    }
  }
};
