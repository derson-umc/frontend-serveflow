import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@core/api/users';
import { createSchema, ROLE_OPTIONS_ADMIN, ROLE_OPTIONS_GERENTE } from '../constants';
import { ModalOverlay, ModalHead, FieldGroup, FormInput, FormSelect, ActionBtn, InlineAlert } from '../shared';

function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function CreateModal({ isAdmin, onClose, onCreated }) {
  const save        = useCreateUser();
  const roleOptions = isAdmin ? ROLE_OPTIONS_ADMIN : ROLE_OPTIONS_GERENTE;
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '', role: 'CAIXA', jobposition: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const created = await save.mutateAsync({
        username:    data.username.trim(),
        email:       data.email?.trim() || null,
        password:    data.password,
        role:        data.role,
        jobposition: data.jobposition.trim(),
      });
      onCreated(created);
    } catch (err) {
      setServerError(err?.response?.data?.error ?? 'Erro ao criar usuário.');
    }
  };

  return (
    <ModalOverlay onClose={onClose} width="max-w-lg">
      <ModalHead
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        }
        title="Novo Usuário"
        subtitle="Preencha os dados do novo usuário"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="px-6 py-5 flex flex-col gap-4">
          {serverError && <InlineAlert msg={serverError} />}

          <FieldGroup label="Username *">
            <FormInput registration={register('username')} error={errors.username?.message} placeholder="ex: joaosilva" />
          </FieldGroup>

          <FieldGroup label="E-mail">
            <FormInput registration={register('email')} error={errors.email?.message} placeholder="ex: joao@email.com" type="email" />
          </FieldGroup>

          <FieldGroup label="Perfil *">
            <FormSelect registration={register('role')} options={roleOptions} />
          </FieldGroup>

          <FieldGroup label="Cargo *">
            <FormInput registration={register('jobposition')} error={errors.jobposition?.message} placeholder="Ex: Caixa de turno" />
          </FieldGroup>

          <FieldGroup label="Senha *">
            <FormInput registration={register('password')} error={errors.password?.message} placeholder="Mínimo 8 caracteres" type="password" />
          </FieldGroup>

          <FieldGroup label="Confirmar Senha *">
            <FormInput registration={register('confirmPassword')} error={errors.confirmPassword?.message} placeholder="Repita a senha" type="password" />
          </FieldGroup>

          <div className="flex gap-3 pt-1">
            <ActionBtn variant="ghost" onClick={onClose}>Cancelar</ActionBtn>
            <ActionBtn type="submit" loading={isSubmitting}>Criar Usuário</ActionBtn>
          </div>
        </div>
      </form>
    </ModalOverlay>
  );
}
