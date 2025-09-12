import {EntityFormProps} from "@/components/crud/entity-crud";
import {DidaticContent, DidaticContentDto} from "@/app/(app)/dashboard/didactic-content/definitions";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {FetchImage} from "@/components/ui/fetch-image";
import {getDidacticContentImageAction} from "@/app/(app)/dashboard/didactic-content/actions";

export function EntityForm({form, entity}: Readonly<EntityFormProps<DidaticContent, DidaticContentDto>>) {
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
        name="content"
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
        name="image"
        render={({field}) => {
          const {value, onChange, ...props} = field;
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
                    {...props}
                  />
                </FormControl>
              </div>
              <FormMessage/>
              <div className="mt-4">
                {entity && !value &&
                  <FetchImage
                    cacheKey={`didactic-content-image-${entity.id}`}
                    fetcher={() => getDidacticContentImageAction(entity.id)}
                    alt={entity.title}
                  />
                }
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