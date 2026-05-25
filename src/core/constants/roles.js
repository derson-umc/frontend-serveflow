export const ROLES = {
  ROOT:       'root',
  ADMIN:      'admin',
  GERENTE:    'gerente',
  GARCON:     'garcon',
  COZINHEIRO: 'cozinheiro',
  CAIXA:      'caixa',
};

export const ADMIN_ROLES   = [ROLES.ROOT, ROLES.ADMIN];
export const GERENTE_ROLES = [ROLES.ROOT, ROLES.ADMIN, ROLES.GERENTE];
export const KDS_ROLES     = [ROLES.ROOT, ROLES.ADMIN, ROLES.GERENTE, ROLES.COZINHEIRO];
export const CAIXA_ROLES   = [ROLES.ROOT, ROLES.ADMIN, ROLES.GERENTE, ROLES.CAIXA];
