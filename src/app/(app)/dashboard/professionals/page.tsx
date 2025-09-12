import {UserBasePage} from "@/app/(app)/dashboard/users/_components/user-base-page";
import {Authority} from "@/app/(app)/dashboard/users/definitions";

export default function Page() {
  return <UserBasePage
    title="Profesionales"
    authorities={[
      Authority.LEGAL_PROFESSIONAL,
      Authority.MEDICAL_PROFESSIONAL
    ]}
  />
}