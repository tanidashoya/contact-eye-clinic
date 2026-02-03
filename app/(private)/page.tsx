import getNewEvents from "./action/get-new-event";
import DateDisplay from "@/components/date-display";
import Section from "@/components/section";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const {
    contactEvent,
    clinicEvent,
    error: getNewEventError,
  } = await getNewEvents(user.id);
  if (getNewEventError) {
    console.error(getNewEventError);
    throw new Error(getNewEventError); //エラーをthrowしてエラーページ(error.tsx)にリダイレクト(アプリの根本的なエラーの場合はthrowする)
  }
  return (
    <div>
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
