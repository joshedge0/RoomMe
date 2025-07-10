"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { LogOut, UserCog } from 'lucide-react';
import { ThemeSwitcher } from "./theme-switcher";

export default function UserMenu() {
  const { data: session } = useSession();

  /*
  if (!session) {
    return (
      <>
        <Button className="cursor-pointer" onClick={() => signIn()}>
          Sign In
        </Button>
      </>
    );
  }
    

  const userInitials = session.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

    <AvatarImage
                src={session.user?.image ?? ""}
                alt={session.user?.name ?? ""}
              />
    */

    const userInitials = 'J'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-max min-w-32 max-w-64"
          align="end"
          forceMount
        >
          <DropdownMenuItem
            className='cursor-pointer'
          >
            <UserCog className='h-4 w-4' />
            <span className='grow'>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <ThemeSwitcher />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='cursor-pointer'
          >
            <LogOut className='h-4 w-4' />
            <span className='grow'>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
