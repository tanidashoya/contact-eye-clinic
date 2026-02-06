"use client";
import { Calendar } from "lucide-react";
import NumberInput from "./number-input";
import updateContactSettings from "@/app/(private)/action/update-contact-settings";
import updateClinicSettings from "@/app/(private)/action/update-clinic-settings";
import { ContactClinicSettingsProps } from "@/types";

export default function ContactClinicSettings({
  userId,
  contactCycle,
  setContactCycle,
  clinicCycle,
  setClinicCycle,
}: ContactClinicSettingsProps) {
  const handleContactCycleChange = (value: number) => {
    setContactCycle(value); //正解の値を更新
    updateContactSettings({
      userId: userId,
      contactCycle: value,
    });
  };

  const handleClinicCycleChange = (value: number) => {
    setClinicCycle(value); //正解の値を更新
    updateClinicSettings({
      userId: userId,
      clinicCycle: value,
    });
  };

  return (
    <>
      <div className="flex items-center ml-4 gap-2 mb-2 mt-6">
        <Calendar size={25} color="gray" />
        <h2 className="text-lg font-bold">コンタクト交換・眼科受診</h2>
      </div>
      <div className="flex flex-col mx-4 px-2 gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="contactCycle">コンタクト交換の周期</label>
          <NumberInput
            id="contactCycle"
            numberValue={contactCycle}
            onValueChange={handleContactCycleChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="clinicCycle">眼科受診の周期</label>
          <NumberInput
            id="clinicCycle"
            numberValue={clinicCycle}
            onValueChange={handleClinicCycleChange}
          />
        </div>
      </div>
    </>
  );
}
