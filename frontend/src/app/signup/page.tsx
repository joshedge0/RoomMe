"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await authClient.signUp.email(
      {
        email, // user email address
        password, // user password -> min 8 characters by default
        name, // user display name
      },
      {
        onRequest: (ctx) => {
          //show loading
        },
        onSuccess: (ctx) => {
          router.push("/");
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        },
      }
    );
  };

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Label htmlFor="username">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
