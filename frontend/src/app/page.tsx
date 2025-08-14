"use client"

import { authClient } from "@/lib/auth-client"

export default function Home() {
  const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 

  return(
    <div>
      <p>{session?.user.name}</p>
    </div>
  )
};

/*
<div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]">
      </div>
      */