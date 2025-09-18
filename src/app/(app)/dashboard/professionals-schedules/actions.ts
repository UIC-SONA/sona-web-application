import {ProfessionalSchedule, ProfessionalScheduleDto, ProfessionalSchedulesDto} from "@/app/(app)/dashboard/professionals-schedules/definitions";
import {client} from "@/lib/http/axios-client";
import {restCrud} from "@/lib/rest-crud";
import {attempt} from "@/lib/result";
import {CalendarDate, parseDate} from "@internationalized/date";
import {parseErrorOrValidationErrors} from "@/lib/errors";

const resource = '/professional-schedule';

/* eslint-disable @typescript-eslint/no-explicit-any */
function entityConverter(model: any): ProfessionalSchedule {
  return {
    ...model,
    date: parseDate(model.date),
  };
}

function dtoConverter(dto: ProfessionalScheduleDto): unknown {
  return {
    ...dto,
    date: dto.date.toString(),
  };
}


const crud = restCrud<ProfessionalSchedule, ProfessionalScheduleDto, number>(client, resource, {
  entityConverter,
  dtoConverter,
});

export const updateProfessionalScheduleAction = crud.update;
export const deleteProfessionalScheduleAction = crud.delete;


export const createMultipleProfessionalSchedulesAction = attempt(async (data: ProfessionalSchedulesDto): Promise<ProfessionalSchedule[]> => {
  const response = await client.post<[]>(
    `${resource}/all`,
    {...data, dates: data.dates.map(d => d.toString())}
  );
  return response.data.map(entityConverter);
}, parseErrorOrValidationErrors);


export const findProfessionalScheduleByProfessional = attempt(async (professionalId: number, from: CalendarDate, to: CalendarDate) => {
  const response = await client.get<ProfessionalSchedule[]>(
    `${resource}/professional/${professionalId}`,
    {
      params: {
        from: from.toString(),
        to: to.toString(),
      },
    }
  );
  
  return response.data.map(entityConverter);
});

