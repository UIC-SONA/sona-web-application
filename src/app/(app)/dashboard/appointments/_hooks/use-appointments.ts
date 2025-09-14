import {useState} from "react";
import {CalendarDate, today} from "@internationalized/date";
import {ZONE_ID} from "@/constants";
import {Authority, User} from "@/app/(app)/dashboard/users/definitions";
import {Appointment, AppointmentType} from "@/app/(app)/dashboard/appointments/definitions";
import {useQuery} from "@tanstack/react-query";
import {unwrap} from "@/lib/result";
import {listAppointmentsAction} from "@/app/(app)/dashboard/appointments/actions";
import {ErrorDescription} from "@/lib/errors";

interface UseAppointmentsProps {
  initialState?: Partial<{
    range: { from: CalendarDate; to: CalendarDate };
    professional: User | null;
    professionalType: Authority.LEGAL_PROFESSIONAL | Authority.MEDICAL_PROFESSIONAL | null;
    attendant: User | null;
    canceled: boolean;
    type: AppointmentType | null;
  }>
}

export const useAppointments = ({initialState}: UseAppointmentsProps = {}) => {
  
  const [range, setRange] = useState(() => initialState?.range || {
    from: today(ZONE_ID),
    to: today(ZONE_ID)
  });
  
  const [professionalType, setProfessionalType] = useState<Authority.LEGAL_PROFESSIONAL | Authority.MEDICAL_PROFESSIONAL | null>(() => initialState?.professionalType || null);
  const [professional, setProfessional] = useState<User | null>(() => initialState?.professional || null);
  const [attendant, setAttendant] = useState<User | null>(() => initialState?.attendant || null);
  const [canceled, setCanceled] = useState<boolean>(() => initialState?.canceled || false);
  const [type, setType] = useState<AppointmentType | null>(() => initialState?.type || null);
  
  const query = useQuery<Appointment[], ErrorDescription>({
    queryKey: ['appointments', range, professional?.id, professionalType, canceled, type],
    queryFn: async () => unwrap(await listAppointmentsAction({
      query: buildRsqlQuery(range, professional, professionalType, canceled, type)
    })),
    enabled: range.from.compare(range.to) != 0 // Avoid initial load
  })
  
  return {
    query,
    filters: {
      range,
      setRange,
      professional,
      setProfessional,
      professionalType,
      setProfessionalType,
      attendant,
      setAttendant,
      canceled,
      setCanceled,
      type,
      setType
    },
  }
}

function buildRsqlQuery(range: { from: CalendarDate; to: CalendarDate }, professional: User | null, professionalType: Authority | null, canceled: boolean, type: AppointmentType | null): string {
  const queries: string[] = [];
  
  queries.push(`date=ge=${range.from.toString()}`);
  queries.push(`date=le=${range.to.toString()}`);
  
  if (professional) {
    queries.push(`professional.id==${professional.id}`);
  }
  
  if (professionalType) {
    queries.push(`professional.authorities=in=(${professionalType})`);
  }
  
  if (canceled) {
    queries.push(`canceled==true`);
  }
  if (type) {
    queries.push(`type==${type}`);
  }
  
  return queries.join(';');
}