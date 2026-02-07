"use client";
import insertContactEvent from "@/app/(private)/action/insert-contact-event";
import { Button } from "./ui/button";
import insertEyecareEvent from "@/app/(private)/action/insert-eyecare-event";
import { toast } from "sonner";
import { DateDisplayProps } from "@/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function DateDisplay({
  eventType,
  occurredAt,
  next,
}: DateDisplayProps) {
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [isClinicLoading, setIsClinicLoading] = useState(false);
  const handleContactClick = async () => {
    setIsContactLoading(true);
    const result = await insertContactEvent();
    if (result?.error) {
      console.error(result.error);
      toast.error(result.error);
    }
    setIsContactLoading(false);
  };
  const handleClinicClick = async () => {
    setIsClinicLoading(true);
    const result = await insertEyecareEvent();
    if (result?.error) {
      console.error(result.error);
      toast.error(result.error);
    }
    setIsClinicLoading(false);
  };
  return (
    <>
      {eventType === "contact" && (
        <div className=" flex flex-col items-center justify-center gap-4 mt-6 w-full">
          <div className=" flex flex-col items-center gap-4 w-full">
            <div className="flex items-end gap-1 w-full">
              <span className="text-lg text-gray-600 pl-8">次回</span>
              {isContactLoading ? (
                <div className="flex flex-1 py-1 items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-pink-300" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-600 flex-1 text-center">
                  {next}
                </p>
              )}
            </div>
            <div className="flex items-end gap-1 w-full">
              <span className="text-lg text-gray-600 pl-8">前回</span>
              {isContactLoading ? (
                <div className="flex flex-1 py-1 items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-pink-300" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-600 flex-1 text-center">
                  {occurredAt}
                </p>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end mr-4">
            <Button
              onClick={handleContactClick}
              className="mt-3 p-6 bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-200 active:bg-green-700 focus:outline-none"
            >
              <span className="text-xl font-bold">交換したよ！</span>
            </Button>
          </div>
        </div>
      )}
      {eventType === "clinic" && (
        <div className=" flex flex-col items-center justify-center gap-4 mt-6 w-full">
          <div className=" flex flex-col items-center gap-4 w-full">
            <div className="flex items-end gap-1 w-full ">
              <span className="text-lg text-gray-600 pl-8">次回</span>
              {isClinicLoading ? (
                <div className="flex flex-1 py-1 items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-pink-300" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-600 flex-1 text-center">
                  {next}
                </p>
              )}
            </div>
            <div className="flex items-end gap-1 w-full">
              <span className="text-lg text-gray-600 pl-8">前回</span>
              {isClinicLoading ? (
                <div className="flex flex-1 py-1 items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-pink-300" />
                </div>
              ) : (
                <p className="text-3xl font-bold text-gray-600 flex-1 text-center">
                  {occurredAt}
                </p>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end mr-4">
            <Button
              onClick={handleClinicClick}
              className="mt-3 p-6 bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-200 active:bg-green-700 focus:outline-none"
            >
              <span className="text-xl font-bold">受診したよ！</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
