"use client"

import {CalendarDate, today} from "@internationalized/date";
import {ZONE_ID} from "@/constants";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import DateRangePicker from "@/components/ui/date-range-picker";
import {Input} from "@/components/ui/input";
import {ProfessionalScheduleDto, ProfessionalSchedulesDto} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {UseFormReturn} from "react-hook-form";
import DatePicker from "@/components/ui/date-picker";


type EntityFormProps = {
  range: true;
  form: UseFormReturn<ProfessionalSchedulesDto>
} | {
  range: false;
  form: UseFormReturn<ProfessionalScheduleDto>
};


export function EntityForm({form: f, range}: Readonly<EntityFormProps>) {
  const now = today(ZONE_ID);
  
  const form = f as UseFormReturn<ProfessionalSchedulesDto | ProfessionalScheduleDto>;
  
  return <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
    {range
      ? <FormField
        control={form.control}
        name="dates"
        render={({field}) => {
          
          return (
            <FormItem className="col-span-1 sm:col-span-2 md:col-span-2">
              <FormLabel>Fecha</FormLabel>
              <DateRangePicker<CalendarDate>
                isDateUnavailable={(date) => date.compare(now) < 0}
                onChange={(value) => {
                  if (!value) {
                    field.onChange([]);
                    return;
                  }
                  field.onChange(getDays(value.start, value.end));
                }}
              />
              <FormMessage/>
            </FormItem>
          );
        }}
      />
      : <FormField
        control={form.control}
        name="date"
        render={({field}) => (
          <FormItem className="col-span-1 sm:col-span-2 md:col-span-2">
            <FormLabel>Fecha</FormLabel>
            <DatePicker<CalendarDate>
              isDateUnavailable={(date) => date.compare(now) < 0}
              {...field}
            />
            <FormMessage/>
          </FormItem>
        )}
      />
    }
    
    <FormField
      control={form.control}
      name="fromHour"
      render={({field}) => (
        <FormItem className="col-span-1">
          <FormLabel>Hora de inicio</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
    
    <FormField
      control={form.control}
      name="toHour"
      render={({field}) => (
        <FormItem className="col-span-1">
          <FormLabel>Hora de fin</FormLabel>
          <FormControl>
            <Input type="number" {...field} />
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
  </div>
}

function getDays(start: CalendarDate, end: CalendarDate): CalendarDate[] {
  const dates = [];
  let current = start;
  while (current.compare(end) <= 0) {
    dates.push(current);
    current = current.add({days: 1});
  }
  return dates;
}
