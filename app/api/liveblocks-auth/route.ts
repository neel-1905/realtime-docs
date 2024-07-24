import { liveblocks } from "@/lib/liveblocks";
import { getRandomBrightHexColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/signIn");
  }

  const { id, firstName, lastName, emailAddresses, imageUrl } = clerkUser;
  // Get the current user from your database
  const user = {
    id,
    info: {
      id,
      name: `${firstName} ${lastName}`,
      email: emailAddresses[0]?.emailAddress,
      avatar: imageUrl,
      color: getRandomBrightHexColor(),
    },
  };

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [], // Optional
    },
    { userInfo: user.info }
  );

  return new Response(body, { status });
}
