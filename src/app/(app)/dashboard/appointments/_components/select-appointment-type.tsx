import {AppointmentType} from "@/app/(app)/dashboard/appointments/definitions";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Laptop, Speech} from "lucide-react";
import {ComponentProps} from "react";

export interface SelectAppointmentTypeProps extends Omit<ComponentProps<typeof SelectTrigger>, 'value' | 'onChange'> {
  value: AppointmentType | null;
  onChange: (value: AppointmentType | null) => void;
}

export function SelectAppointmentType({value, onChange, ...props}: Readonly<SelectAppointmentTypeProps>) {
  return (
    <Select
      value={value ?? "ALL"}
      onValueChange={(value) => onChange(value === "ALL" ? null : value as AppointmentType)}
    >
      <SelectTrigger {...props}>
        <SelectValue placeholder="Tipo de cita"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">
          Todos
        </SelectItem>
        <SelectItem value="VIRTUAL">
          <div className="flex items-center space-x-2">
            <Laptop size={18}/>
            <p>Virtual</p>
          </div>
        </SelectItem>
        <SelectItem value="PRESENTIAL">
          <div className="flex items-center space-x-2">
            <Speech size={18}/>
            <p>Presencial</p>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
