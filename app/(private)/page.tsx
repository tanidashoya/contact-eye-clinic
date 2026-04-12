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
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2 lg:gap-8">
      <Section
        subtitle="Contact Lens"
        title="コンタクト交換"
        description="次回のコンタクト交換日を確認できます。"
      >
        <DateDisplay
          eventType="contact"
          occurredAt={contactEvent?.occurred_at}
          next={contactEvent?.next_due_at}
        />
      </Section>
      <Section
        subtitle="Eye Clinic"
        title="眼科受診"
        description="次回の眼科受診日を確認できます。"
      >
        <DateDisplay
          eventType="clinic"
          occurredAt={clinicEvent?.occurred_at}
          next={clinicEvent?.next_due_at}
        />
      </Section>
    </div>
  );
}
