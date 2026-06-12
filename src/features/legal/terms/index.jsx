import { LegalPage } from '../components/LegalPage';

const SECTIONS = [
  {
    heading: '1. Finalidade do Sistema',
    content:
      'O Serverflow é um sistema destinado à gestão operacional de restaurantes, incluindo controle de pedidos, usuários e operações internas. O uso é exclusivo ao estabelecimento contratante e seus colaboradores autorizados.',
  },
  {
    heading: '2. Controle de Acesso',
    content:
      'O sistema possui um usuário administrador nativo, responsável pela criação e gerenciamento de usuários do tipo gerente. Gerentes e administradores podem cadastrar, editar e excluir demais usuários do estabelecimento.',
  },
  {
    heading: '3. Responsabilidade pelos Acessos',
    content:
      'O restaurante é integralmente responsável pelos acessos criados no sistema, bem como pelas ações realizadas por seus usuários. O Serverflow não se responsabiliza por uso indevido das credenciais internas.',
  },
  {
    heading: '4. Segurança',
    content:
      'As operações sensíveis, como alteração de senha e exclusão de usuários, são restritas aos perfis de administrador e gerente, garantindo maior controle e rastreabilidade das ações.',
  },
  {
    heading: '5. Uso Adequado',
    content:
      'O sistema deve ser utilizado exclusivamente para fins operacionais do estabelecimento, sendo proibido qualquer uso indevido ou fora do escopo da atividade empresarial.',
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      lastUpdated="Junho de 2025"
      sections={SECTIONS}
    />
  );
}
