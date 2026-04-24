export const ROLES = {
  ROOT: 'root',
  ADMIN: 'admin',
  CAIXA: 'caixa',
  GARCON: 'garcon',
  COZINHEIRO: 'cozinheiro',
};

export const ADMIN_ROLES = [ROLES.ROOT, ROLES.ADMIN];
export const CAIXA_ROLES = [ROLES.ROOT, ROLES.ADMIN, ROLES.CAIXA];
