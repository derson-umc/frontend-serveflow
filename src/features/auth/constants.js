import { z } from 'zod';
import { USERNAME_MIN, USERNAME_MAX, PASSWORD_MIN, PASSWORD_MAX } from '@shared/utils/validators';

export const G  = '#2E7D32';
export const GD = '#1B5E20';
export const O  = '#F57C00';
export const D  = '#424242';
export const M  = '#757575';
export const W  = '#FFFFFF';
export const B  = '#E0E0E0';

export const STRENGTH_COLORS = ['#E0E0E0', '#EF9A9A', '#EF5350', '#43A047', '#2E7D32', '#1B5E20'];

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Usuário é obrigatório')
    .min(USERNAME_MIN, `Mínimo ${USERNAME_MIN} caracteres`)
    .max(USERNAME_MAX, 'Usuário muito longo')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Use apenas letras, números, . _ -'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(PASSWORD_MIN, `Mínimo ${PASSWORD_MIN} caracteres`)
    .max(PASSWORD_MAX, 'Senha muito longa'),
});
