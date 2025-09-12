import {ProfessionalSchedule, ProfessionalScheduleDto, scheduleDefaultValues, scheduleResolver} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {updateProfessionalScheduleAction} from "@/app/(app)/dashboard/professionals-schedules/actions";
import {FormDialog} from "@/components/crud/shadcdn/form-dialog";
import {SaveIcon} from "lucide-react";
import {EntityForm} from "@/app/(app)/dashboard/professionals-schedules/_components/form";
import {Dispatch, SetStateAction} from "react";
import {useEntityUpdate} from "@/components/crud/use-entity-update";
import {toast} from "sonner";

export interface UpdateProfessionalScheduleFormProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  schedule: ProfessionalSchedule | null;
  setSchedule: Dispatch<SetStateAction<ProfessionalSchedule | null>>;
  oldSchedule: ProfessionalSchedule | null;
  updateSchedule: (schedule: ProfessionalSchedule) => void;
}

export function UpdateProfessionalScheduleForm({
  open,
  onOpenChange,
  schedule,
  oldSchedule,
  updateSchedule,
  setSchedule,
}: Readonly<UpdateProfessionalScheduleFormProps>) {
  
  const {form, submit} = useEntityUpdate<ProfessionalSchedule, ProfessionalScheduleDto>({
    updateAction: updateProfessionalScheduleAction,
    entity: schedule as ProfessionalSchedule,
    resolver: scheduleResolver,
    defaultValues: scheduleDefaultValues,
    onSuccess: (updatedSchedule) => {
      updateSchedule(updatedSchedule);
      setSchedule(null);
      onOpenChange(false);
      toast.success('Horario actualizado', {
        description: 'El horario de atención ha sido actualizado correctamente.',
      });
    }
  });
  
  const resetSchedule = () => {
    if (oldSchedule) {
      updateSchedule(oldSchedule);
    }
  }
  
  const onOpenChangeHandle = (open: boolean) => {
    onOpenChange(open);
    resetSchedule();
  }
  
  return <FormDialog
    title="Actualizar horario"
    description="Actualizar horario de atención"
    dialogClassName='max-w-[90vw] max-h-[90vh] overflow-y-auto min-w-[80vw]'
    open={open}
    onOpenChange={onOpenChangeHandle}
    form={form}
    submit={submit}
    confirmButtonText="Actualizar"
    confirmButtonIcon={<SaveIcon/>}
  >
    <EntityForm range={false} form={form}/>
  </FormDialog>
}
