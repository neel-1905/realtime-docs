import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Document = async ({ params }: { params: { id: string } }) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/signIn");

  const room = await getDocument({
    roomId: params.id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers(userIds);
  // TODO: Assess the permissions of the user to access the document

  const usersData = users.map((item: User) => ({
    ...item,
    userType: room.usersAccesses[item?.email]?.includes("room:write")
      ? "editor"
      : "viewer",
  }));

  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ]?.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        users={usersData}
        roomId={params.id}
        roomMetadata={room.metadata}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
