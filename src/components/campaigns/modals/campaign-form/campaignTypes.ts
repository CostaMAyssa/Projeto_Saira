
export interface CampaignType {
  name: string;
  description: string;
  template: string;
}

export const campaignTypes: Record<string, CampaignType> = {
  recompra: {
    name: 'Lembrete de Recompra',
    description: 'Notificar clientes sobre a necessidade de recompra de medicamentos de uso contínuo.',
    template: 'Olá {nome}, notamos que seu medicamento {medicamento} está próximo de acabar. Temos disponível para retirada na farmácia. Podemos separar para você?'
  },
  aniversario: {
    name: 'Aniversário',
    description: 'Mensagem de felicitação pelo aniversário com oferta especial.',
    template: 'Olá {nome}, a equipe da Farmácia Saíra deseja um Feliz Aniversário! Como presente, você tem 10% de desconto em qualquer produto hoje!'
  },
  posvenda: {
    name: 'Pós-venda',
    description: 'Acompanhamento após a venda de produtos específicos.',
    template: 'Olá {nome}, como foi a experiência com {produto} que adquiriu conosco? Estamos à disposição para qualquer dúvida ou orientação adicional.'
  },
  reativacao: {
    name: 'Reativação',
    description: 'Campanha para reconectar com clientes inativos.',
    template: 'Olá {nome}, sentimos sua falta! Faz algum tempo que não nos visita e preparamos ofertas especiais para você. Venha conferir!'
  },
  promocao: {
    name: 'Promoção',
    description: 'Divulgação de ofertas e promoções para clientes específicos.',
    template: 'Olá {nome}, temos uma oferta especial para você! {produto} com até 20% de desconto até o fim de semana. Aproveite!'
  }
};
