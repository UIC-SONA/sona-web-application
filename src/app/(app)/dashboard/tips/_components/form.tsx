import {EntityFormProps} from "@/components/crud/entity-crud";
import {Tip, TipDto} from "@/app/(app)/dashboard/tips/definitions";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {FetchImage} from "@/components/ui/fetch-image";
import {getTipImageAction} from "@/app/(app)/dashboard/tips/actions";
import MultipleSelector from "@/components/ui/multiselect";

export function EntityForm({form, entity}: Readonly<EntityFormProps<Tip, TipDto>>) {
  const {control} = form;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FormField
        control={control}
        name="title"
        render={({field}) => (
          <FormItem className="lg:col-span-2">
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input placeholder="Título" {...field} />
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="summary"
        render={({field}) => {
          return (
            <FormItem className="lg:col-span-2">
              <FormLabel>Resumen</FormLabel>
              <FormControl>
                <Input placeholder="Resumen" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        defaultValue={false}
        name="active"
        render={({field}) => {
          return (
            <FormItem className="flex items-center space-x-3 sm:col-span-2 lg:col-span-4">
              <FormLabel className="m-0">Activo</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        name="description"
        render={({field}) => {
          return (
            <FormItem className="sm:col-span-2 lg:col-span-4">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción" className="resize-y min-h-32" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        name="tags"
        render={({field}) => {
          return (
            <FormItem className="sm:col-span-2 lg:col-span-4">
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultipleSelector
                  placeholder="Tags"
                  creatable
                  value={field.value?.map((tag) => ({label: tag, value: tag}))}
                  onChange={(tags) => field.onChange(tags.map((tag) => tag.value))}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          );
        }}
      />
      <FormField
        control={control}
        name="image"
        render={({field}) => {
          const {value, onChange, ...rest} = field;
          
          return (
            <FormItem
              className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="flex flex-col w-full space-y-2">
                <FormLabel>Imagen</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    onChange={(e) => {
                      onChange(e.target.files?.[0]);
                    }}
                    {...rest}
                  />
                </FormControl>
              </div>
              <FormMessage/>
              <div className="mt-4">
                {entity && !value &&
                  <FetchImage
                    cacheKey={`tip-image-${entity.id}`}
                    fetcher={() => getTipImageAction(entity.id)}
                    alt={entity.title}
                  />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {value && <img src={URL.createObjectURL(value)} alt="Preview"/>}
              </div>
            </FormItem>
          );
        }}
      />
    </div>
  );
}