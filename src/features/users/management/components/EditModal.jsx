import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';
import { editSchema, ROLE_OPTIONS_ADMIN, ROLE_OPTIONS_GERENTE } from '../constants';
import { ModalOverlay, ModalHead, FieldGroup, FormInput, FormSelect, ActionBtn, InlineAlert } from '../shared';

function useUpdateUser(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

function getBlockReason(targetRole, isSelf, isAdmin, isGerente) {
  if (isAdmin) return null;
  if (!isGerente) return 'Sem permissão para editar este usuário.';
  if (targetRole === 'ADMIN') return 'Você não tem permissão para editar usuários Admin.';
  if (targetRole === 'GERENTE' && !isSelf) return 'Gerente só pode editar o próprio perfil.';
  return null;
}

export function EditModal({ user, isAdmin, isGerente, meUsername, onClose, onSaved }) {
  const save        = useUpdateUser(user.id);
  const targetRole  = user.role?.toUpperCase();
  const isSelf      = meUsername === user.username;
  const blockReason = getBlockReason(targetRole, isSelf, isAdmin, isGerente);
  const roleOptions = isAdmin ? ROLE_OPTIONS_ADMIN : ROLE_OPTIONS_GERENTE;
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      username:    user.username,
      email:       user.email ?? '',
      role:        user.role?.toUpperCase() ?? 'GERENTE',
      jobposition: user.jobposition ?? '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const updated = await save.mutateAsync({
        username:    data.username.trim(),
        email:       data.email?.trim() || null,
        password:    null,
        role:        data.role,
        jobposition: data.jobposition.trim(),
      });
      onSaved(updated);
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Erro ao atualizar usuário.');
    }
  };

  return (
    <ModalOverlay onClose={onClose} width="max-w-lg">
      <ModalHead
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
        title="Editar Usuário"
        subtitle={`Editando: @${user.username}`}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="px-6 py-5 flex flex-col gap-4">
          {blockReason && <InlineAlert msg={blockReason} />}
          {serverError && <InlineAlert msg={serverError} />}

          <FieldGroup label="Username *">
            <FormInput registration={register('username')} error={errors.username?.message} placeholder="username" disabled={!!blockReason} />
          </FieldGroup>

          <FieldGroup label="E-mail">
            <FormInput registration={register('email')} error={errors.email?.message} placeholder="ex: joao@email.com" type="email" disabled={!!blockReason} />
          </FieldGroup>

          <FieldGroup label="Perfil *">
            <FormSelect registration={register('role')} options={roleOptions} disabled={!!blockReason} />
          </FieldGroup>

          <FieldGroup label="Cargo *">
            <FormInput registration={register('jobposition')} error={errors.jobposition?.message} placeholder="Ex: Gerente de turno" disabled={!!blockReason} />
          </FieldGroup>

          <div className="flex gap-3 pt-1">
            <ActionBtn variant="ghost" onClick={onClose}>Cancelar</ActionBtn>
            <ActionBtn type="submit" loading={isSubmitting} disabled={!!blockReason}>Salvar</ActionBtn>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}
