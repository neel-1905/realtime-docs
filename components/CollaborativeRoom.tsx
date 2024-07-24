"use client";

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import React, {
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Loader from "./Loader";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/room.actions";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  currentUserType,
  users,
}: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (documentTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitle);

          if (updatedDocument) setEditing(false);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        if (documentTitle !== roomMetadata.title) {
          updateDocument(roomId, documentTitle);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside as any);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as any);
    };
  }, [roomId, documentTitle]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div
              ref={containerRef}
              className="flex w-fit items-center justify-center gap-2"
            >
              {/* <p className="document-title">Share </p> */}
              {editing && !loading ? (
                <Input
                  type="text"
                  placeholder="Enter title"
                  ref={inputRef}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  value={documentTitle}
                  disabled={!editing}
                  className="document-title-input"
                />
              ) : (
                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              )}

              {currentUserType === "editor" && !editing ? (
                <Image
                  src={`/assets/icons/edit.svg`}
                  alt="Edit"
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)}
                  className="pointer"
                />
              ) : null}

              {currentUserType !== "editor" && !editing ? (
                <p className="view-only-tag">View only</p>
              ) : null}

              {loading && <p className="text-sm text-gray-400">Saving...</p>}
            </div>

            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
