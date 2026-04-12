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
        title="コンタクト交換"
        description="前回の交換日と次回の目安を、落ち着いた見た目で確認できます。"
      >
        <DateDisplay
          eventType="contact"
          occurredAt={contactEvent?.occurred_at}
          next={contactEvent?.next_due_at}
        />
      </Section>
      <Section
        title="眼科受診"
        description="受診の間隔を無理なく管理して、次の予定を見失わないためのカードです。"
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
