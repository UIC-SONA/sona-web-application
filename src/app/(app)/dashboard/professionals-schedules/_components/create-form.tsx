import {useEntityCreate} from "@/components/crud/use-entity-create";
import {ProfessionalSchedule, ProfessionalSchedulesDto, schedulesResolver} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {createMultipleProfessionalSchedulesAction} from "@/app/(app)/dashboard/professionals-schedules/actions";
import {toast} from "sonner";
import {FormDialog} from "@/components/crud/shadcdn/form-dialog";
import {SaveIcon} from "lucide-react";
import {EntityForm} from "@/app/(app)/dashboard/professionals-schedules/_components/form";
import {Dispatch, SetStateAction, useEffect} from "react";
import {User} from "@/app/(app)/dashboard/users/definitions";

export interface CreateProfessionalScheduleFormProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  professional: User | null;
  addSchedules: (schedule: ProfessionalSchedule[]) => void;
}

export function CreateProfessionalScheduleForm({
  open,
  onOpenChange,
  professional,
  addSchedules,
}: Readonly<CreateProfessionalScheduleFormProps>) {
  
  const {form, submit} = useEntityCreate<ProfessionalSchedule[], ProfessionalSchedulesDto>({
    createAction: createMultipleProfessionalSchedulesAction,
    resolver: schedulesResolver,
    defaultValues: {
      dates: [],
      fromHour: 8,
      toHour: 18,
      professionalId: professional?.id,
    },
    onSuccess: (schedules) => {
      addSchedules(schedules);
      onOpenChange(false);
      toast.success('Horario creado', {
        description: 'El horario de atención ha sido creado correctamente.',
      });
    }
  });
  
  useEffect(() => {
    form.reset({
      ...form.getValues(),
      professionalId: professional?.id,
    });
  }, [form, professional?.id]);
  
  return <FormDialog
    title="Agregar horario de atención"
    description={`Agregar horario de atención para ${professional?.firstName} ${professional?.lastName}`}
    dialogClassName='max-w-[90vw] max-h-[90vh] overflow-y-auto min-w-[80vw]'
    open={open}
    onOpenChange={onOpenChange}
    form={form}
    submit={submit}
    confirmButtonText="Crear"
    confirmButtonIcon={<SaveIcon/>}
  >
    <EntityForm range={true} form={form}/>
  </FormDialog>
}
