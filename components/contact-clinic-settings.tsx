import { Calendar } from "lucide-react";
import { Input } from "./ui/input";

interface ContactClinicSettingsProps {
  contactCycle: number;
  setContactCycle: (contactCycle: number) => void;
  eyeCareCycle: number;
  setEyeCareCycle: (eyeCareCycle: number) => void;
}

export default function ContactClinicSettings({
  contactCycle,
  setContactCycle,
  eyeCareCycle,
  setEyeCareCycle,
}: ContactClinicSettingsProps) {
  return (
    <>
      <div className="flex items-center ml-4 gap-2 mb-2 mt-6">
        <Calendar size={25} color="gray" />
        <h2 className="text-lg font-bold">コンタクト交換・眼科受診</h2>
      </div>
      <div className="flex flex-col mx-4 px-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="contactCycle">コンタクト交換の周期</label>
          <Input
            id="contactCycle"
            type="number"
            value={contactCycle}
            onChange={(e) => setContactCycle(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="eyeCareCycle">眼科受診の周期</label>
          <Input
            id="eyeCareCycle"
            type="number"
            value={eyeCareCycle}
            onChange={(e) => setEyeCareCycle(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  );
}
