import { LegalPage } from '../components/LegalPage';

const SECTIONS = [
  {
    heading: '1. Coleta de Dados',
    content:
      'O sistema armazena dados como nome, login, perfil de acesso e credenciais dos usuários cadastrados pelo restaurante. Não são coletados dados pessoais sensíveis além do estritamente necessário para a operação interna.',
  },
  {
    heading: '2. Finalidade',
    content:
      'Os dados são utilizados exclusivamente para autenticação, controle de acesso e operação interna do sistema. Nenhuma informação é compartilhada com terceiros ou utilizada para fins comerciais.',
  },
  {
    heading: '3. Armazenamento',
    content:
      'Os dados são armazenados em ambiente seguro em nuvem, com infraestrutura baseada em Supabase (banco de dados), Render (backend) e Vercel (frontend), todos com padrões de segurança adequados.',
  },
  {
    heading: '4. Acesso aos Dados',
    content:
      'O acesso às informações é restrito aos usuários com perfil de administrador e gerente definidos pelo próprio restaurante. Colaboradores com perfis operacionais não têm acesso a dados de outros usuários.',
  },
  {
    heading: '5. Responsabilidade',
    content:
      'O restaurante é o controlador dos dados inseridos no sistema, sendo responsável pela gestão, manutenção e exclusão das informações conforme a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      lastUpdated="Junho de 2025"
      sections={SECTIONS}
    />
  );
}
