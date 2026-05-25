import { z } from 'zod';

export const ROLE_OPTIONS_GERENTE = [
  { value: 'GERENTE',    label: 'Gerente'    },
  { value: 'CAIXA',      label: 'Caixa'      },
  { value: 'GARCON',     label: 'Garçom'     },
  { value: 'COZINHEIRO', label: 'Cozinheiro' },
];

export const ROLE_OPTIONS_ADMIN = [
  { value: 'ADMIN', label: 'Admin' },
  ...ROLE_OPTIONS_GERENTE,
];

export const ROLE_META = {
  ADMIN:      { label: 'Admin',      dot: '#f43f5e' },
  GERENTE:    { label: 'Gerente',    dot: '#f97316' },
  CAIXA:      { label: 'Caixa',      dot: '#60a5fa' },
  GARCON:     { label: 'Garçom',     dot: '#34d399' },
  COZINHEIRO: { label: 'Cozinheiro', dot: '#a78bfa' },
  USER:       { label: 'User',       dot: '#94a3b8' },
};

export const FILTER_TABS = [
  { value: 'ALL',        label: 'Todos'      },
  { value: 'ADMIN',      label: 'Admin'      },
  { value: 'GERENTE',    label: 'Gerente'    },
  { value: 'CAIXA',      label: 'Caixa'      },
  { value: 'GARCON',     label: 'Garçom'     },
  { value: 'COZINHEIRO', label: 'Cozinheiro' },
];

export const editSchema = z.object({
  username:    z.string().min(3, 'Mínimo 3 caracteres').max(64, 'Máximo 64 caracteres'),
  email:       z.string().email('E-mail inválido').max(120, 'E-mail muito longo').optional().or(z.literal('')),
  role:        z.enum(['ADMIN', 'GERENTE', 'CAIXA', 'GARCON', 'COZINHEIRO']),
  jobposition: z.string().min(2, 'Cargo é obrigatório'),
});

export const resetSchema = z
  .object({
    newPassword:     z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const createSchema = z
  .object({
    username:        z.string().min(3, 'Mínimo 3 caracteres').max(64, 'Máximo 64 caracteres'),
    email:           z.string().email('E-mail inválido').max(120, 'E-mail muito longo').optional().or(z.literal('')),
    password:        z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Senha muito longa'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
    role:            z.enum(['ADMIN', 'GERENTE', 'CAIXA', 'GARCON', 'COZINHEIRO']),
    jobposition:     z.string().min(2, 'Cargo é obrigatório'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
