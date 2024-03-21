"use client";

import Link from "@/components/Link";
import { cn } from "@/lib/utils";
import { Button } from "@nextui-org/button";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/navbar";
import Image from "next/image";
import { useState } from "react";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      isBlurred={false}
      classNames={{
        wrapper: "px-0 sm:px-4",
      }}
    >
      <div
        className={cn([
          "mx-auto flex h-full max-w-[1100px] flex-1 items-center gap-x-4 rounded-b-lg border border-t-0 border-content3 bg-content1 px-2 shadow",
        ])}
      >
        <NavbarContent className="max-w-[110px] ">
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            data-cy="nav-menu-toggle"
            className="h-14 md:hidden"
          />
          <NavbarBrand>
            <Link
              href={"/"}
              data-cy="logo-link"
              className="relative h-[56px] w-[100px]"
            >
              <Image
                src={"/images/lingopal-logo.svg"}
                alt={"Lingopal Logo"}
                fill
              />
            </Link>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent className="hidden md:flex" justify="end">
          <NavbarItem>
            <Link
              href="https://calendly.com/lingopal-ai/lingopal-ai-demo"
              data-cy="calendly-demo"
            >
              <Button
                radius="sm"
                variant="ghost"
                color="secondary"
                className="font-medium"
              >
                Schedule Demo
              </Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu className="gap-y-4">
          <NavbarMenuItem>
            <Link href="/" data-cy="nav-mobile-home-link">
              Home
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              href="https://calendly.com/lingopal-ai/lingopal-ai-demo"
              data-cy="nav-mobile-calendly-link"
            >
              Schedule a Demo
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link
              target="_blank"
              href="/login"
              data-cy="nav-mobile-login-link"
              className="text-primary"
            >
              Sign In
            </Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </div>
    </Navbar>
  );
}
