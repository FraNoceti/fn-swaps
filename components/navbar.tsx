"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

function Navbar() {
  const pathname = usePathname();

  return (
    <nav className=" flex gap-4 pt-8 mb-8 w-full justify-center items-center fixed">
      <h1 className=" absolute left-5 top-2 font-black self-start">Francesco Noceti Swap</h1>
      <Link href="/">
        <Button variant={pathname === "/" ? "secondary" : "default"}>
          Presetted
        </Button>
      </Link>
      <Link href="/swap">
        <Button variant={pathname === "/swap" ? "secondary" : "default"}>
          Swap
        </Button>
      </Link>
    </nav>
  );
}

export default Navbar;
