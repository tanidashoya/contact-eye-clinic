import getNewEvents from "./action/get-new-event";
import DateDisplay from "@/components/date-display";
import Section from "@/components/section";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();
  if (getUserError || !user) {
    console.error(getUserError);
    redirect("/login?error=user_not_found");
  }

  const {
    contactEvent,
    clinicEvent,
    error: getNewEventError,
  } = await getNewEvents(user.id);
  if (getNewEventError) {
    console.error(getNewEventError);
    redirect("/login?error=get_new_event_error");
  }
  return (
    <div className="w-full flex flex-col items-center justify-center gap-16">
      <Section title="コンタクト交換">
        <DateDisplay
          eventType="contact"
          occurredAt={contactEvent?.occurred_at}
          next={contactEvent?.next_due_at}
        />
      </Section>
      <Section title="眼科受診">
        <DateDisplay
          eventType="clinic"
          occurredAt={clinicEvent?.occurred_at}
          next={clinicEvent?.next_due_at}
        />
      </Section>
    </div>
  );
}
