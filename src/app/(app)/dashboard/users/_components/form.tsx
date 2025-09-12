import {authorities, Authority, User, UserDto} from "@/app/(app)/dashboard/users/definitions";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {EnableChangePassword} from "@/app/(app)/dashboard/users/_components/enable-change-password";
import {EntityFormProps} from "@/components/crud/entity-crud";
import MultipleSelector, {Option} from "@/components/ui/multiselect";

export function EntityForm({form, entity}: Readonly<EntityFormProps<User, UserDto>>) {
  const {control} = form;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FormField
        control={control}
        name="username"
        render={({field}) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Nombre de Usuario</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de Usuario" {...field} autoComplete="off"/>
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
      {entity
        ? <EnableChangePassword form={form}/>
        : <FormField
          control={control}
          name="password"
          render={({field}) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Contraseña" {...field} autoComplete="off"/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      }
      <FormField
        control={control}
        name="firstName"
        render={({field}) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input placeholder="Nombre" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="lastName"
        render={({field}) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Apellido</FormLabel>
            <FormControl>
              <Input placeholder="Apellido" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="email"
        render={({field}) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Correo</FormLabel>
            <FormControl>
              <Input placeholder="Correo" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="authorities"
        render={({field}) => (
          <FormItem className="lg:col-span-2 mb-5">
            <FormLabel>Roles</FormLabel>
            <FormControl>
              <MultipleSelector
                options={Object.keys(authorities).map(key => authorityToOption(key as Authority))}
                value={field.value.map(authorityToOption)}
                onChange={options => field.onChange(options.map(optionToAuthority))}
              />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
    </div>
  );
}

function authorityToOption(authority: Authority): Option {
  return {
    value: authority,
    label: authorities[authority] ?? authority
  };
}

function optionToAuthority(option: Option): Authority {
  return option.value as Authority;
}