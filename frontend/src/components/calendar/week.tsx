"use client";

import { Day } from "./day";

export function Week() {
  return (
    <div className="grid grid-cols-7 h-[150px] [&:last-child>*]:border-b-0">
      <Day day="1" />
      <Day day="1" />
      <Day day="1" />
      <Day day="1" />
      <Day day="1" />
      <Day day="1" />
      <Day day="1" />
    </div>
  );
}
