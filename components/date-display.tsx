"use client";
import insertContactEvent from "@/app/(private)/action/insert-contact-event";
import { Button } from "./ui/button";
import insertEyecareEvent from "@/app/(private)/action/insert-eyecare-event";
import { toast } from "sonner";

interface DateDisplayProps {
  eventType?: string;
  occurredAt?: string;
  next?: string;
}

export default function DateDisplay({
  eventType,
  occurredAt,
  next,
}: DateDisplayProps) {
  const handleClick = async () => {
    if (eventType === "contact") {
      const result = await insertContactEvent();
      if (result?.error) {
        console.error(result.error);
        toast.error(result.error);
      }
    } else if (eventType === "clinic") {
      const result = await insertEyecareEvent();
      if (result?.error) {
        console.error(result.error);
        toast.error(result.error);
      }
    }
  };

  return (
    <>
      {eventType === "contact" && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="flex flex-col items-center gap-4">
            <p>次回交換日：{next}</p>
            <p>交換した日：{occurredAt}</p>
          </div>
          <Button onClick={handleClick}>交換した！</Button>
        </div>
      )}
      {eventType === "clinic" && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="flex flex-col items-center gap-4">
            <p>次回受診日：{next}</p>
            <p>受診した日：{occurredAt}</p>
          </div>
          <Button onClick={handleClick}>受診した！</Button>
        </div>
      )}
    </>
  );
}
