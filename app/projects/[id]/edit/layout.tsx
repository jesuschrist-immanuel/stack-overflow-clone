import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Project - CodingOH",
};

export default async function PageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();
  const { data: coder, error: coderError } = await supabase
    .from("coders")
    .select("*")
    .eq("id", project.owner)
    .single();

  if (userError || !user) {
    redirect("/login");
  }

  if (projectError || !project || coder.auth_id != user.id) {
    redirect("/");
  }

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
