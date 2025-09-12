import {ProfessionalSchedule} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {Dispatch, SetStateAction} from "react";
import {deleteProfessionalScheduleAction} from "@/app/(app)/dashboard/professionals-schedules/actions";
import {useEntityDelete} from "@/components/crud/use-entity-delete";
import {toast} from "sonner";
import {FormDialog} from "@/components/crud/shadcdn/form-dialog";
import {TrashIcon} from "lucide-react";

export interface DeleteProfessionalScheduleFormProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  schedule: ProfessionalSchedule | null;
  removeSchedule: (schedule: ProfessionalSchedule) => void;
  setScheduleViewOpen: Dispatch<SetStateAction<boolean>>;
}

export function DeleteProfessionalScheduleForm({
  open,
  onOpenChange,
  schedule,
  removeSchedule,
  setScheduleViewOpen
}: Readonly<DeleteProfessionalScheduleFormProps>) {
  
  const {form, submit} = useEntityDelete({
    entity: schedule as ProfessionalSchedule,
    deleteAction: deleteProfessionalScheduleAction,
    onSuccess: deleted => {
      removeSchedule(deleted);
      setScheduleViewOpen(false);
      toast.success('Horario eliminado correctamente');
    }
  });
  
  return <FormDialog
    title="Eliminar horario"
    description="¿Está seguro que desea eliminar el horario de atención?"
    open={open}
    onOpenChange={onOpenChange}
    form={form}
    submit={submit}
    confirmButtonText="Eliminar"
    confirmButtonIcon={<TrashIcon/>}
  >
  </FormDialog>
}


