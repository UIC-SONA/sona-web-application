import {type DefaultValues, type FieldValues, type Resolver, useForm} from "react-hook-form";
import {useEffect} from "react";
import {setFormErrors} from "@/lib/forms";
import type {Creatable, Entity} from "@/lib/crud";

export interface EntityCreateProps<TEntity extends Entity<ID>, ID, Dto extends FieldValues> {
  createAction: Creatable<TEntity, Dto>['create'];
  resolver: () => Resolver<Dto>;
  defaultValues: () => DefaultValues<Dto>;
  onSuccess?: (entity: TEntity) => (void | Promise<void>);
}

export interface EntityCreate<Dto extends FieldValues> {
  form: ReturnType<typeof useForm<Dto>>;
  submit: () => Promise<void>;
}

export function useEntityCreate<TEntity extends Entity<ID>, ID, Dto extends FieldValues>({
  createAction,
  resolver,
  defaultValues,
  onSuccess,
}: EntityCreateProps<TEntity, ID, Dto>): EntityCreate<Dto> {
  
  const form = useForm<Dto>({
    resolver: resolver(),
    defaultValues: defaultValues(),
  });
  
  useEffect(() => {
    form.reset(defaultValues());
  }, [defaultValues, form]);
  
  const submit = form.handleSubmit(async (dto: Dto) => {
    const result = await createAction(dto)
    if (result.success) {
      if (onSuccess) await onSuccess(result.data);
      form.reset(defaultValues());
    } else {
      setFormErrors(form, result.error);
      throw result.error;
    }
  });
  
  return {
    form,
    submit
  };
}