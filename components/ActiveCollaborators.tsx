"use client";
import { useOthers } from "@liveblocks/react/suspense";
import Image from "next/image";
import React from "react";

const ActiveCollaborators = () => {
  const others = useOthers();

  const collaborators = others.map((person) => person.info);

  return (
    <ul className="collaborators-list">
      {collaborators.map(({ avatar, color, email, id, name }) => {
        return (
          <li key={id}>
            <Image
              src={avatar}
              alt={name}
              width={100}
              height={100}
              className="inline-block size-8 rounded-full ring-2 ring-dark-100"
              style={{ border: `3px solid ${color}` }}
              title={name}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default ActiveCollaborators;
