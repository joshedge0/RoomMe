"use client";

import UserMenu from "./user-menu";
import { Button } from "../ui/button";
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();

  return (
    <div className="flex justify-between w-full">
      <div className="">
        <Button className="mr-4" onClick={()=>router.push('/')}>Home</Button>
        <Button onClick={()=>router.push('/calendar')}>Calendar</Button>
      </div>
      <UserMenu />
    </div>
  );
}


