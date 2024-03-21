"use client";

import AccountModal from "&/account-modal";
import { Icon } from "@iconify/react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/navbar";
import { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@nextui-org/button";

type NavLink = {
  href: string;
  text: string;
  icon: string;
  role?: Role;
};

const links: Array<NavLink> = [
  // {
  //   href: "/accounts",
  //   text: "Accounts",
  //   icon: "line-md:account",
  //   role: Role.ADMIN,
  // },
];

export default function NavBar({ userRole }: { userRole: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function navigateRoute(route: string) {
    setIsMenuOpen(false);
    router.push(route);
  }

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="full"
      isBlurred={false}
      data-cy="auth-navbar"
      classNames={{
        wrapper: "px-0 sm:px-4",
      }}
    >
      {/* Desktop View */}
      <div className="mx-auto flex h-full max-w-[1400px] flex-1 items-center gap-x-0 rounded-b-lg border border-t-0 border-gray-800 bg-content1 px-2 shadow">
        <NavbarContent className="md:max-w-[250px] ">
          {userRole !== Role.ANONYMOUS && (
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              data-cy="auth-navbar-menu-toggle"
              className="h-14 md:hidden"
            />
          )}
          <NavbarBrand>
            <Link
              href={userRole === Role.ANONYMOUS ? "#" : "/"}
              replace
              data-cy="auth-navbar-logo-link"
              className="relative h-[56px] w-[100px]"
            >
              <Image
                src={"/images/lingopal-logo.svg"}
                alt={"Lingopal Logo"}
                fill
                priority
              />
            </Link>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent
          className="hidden h-14 gap-2 pl-2 md:flex"
          justify="start"
        ></NavbarContent>
        {userRole !== Role.ANONYMOUS && (
          <NavbarContent className="hidden h-14 md:flex" justify="end">
            <NavbarMenuItem>
              <AccountModal />
            </NavbarMenuItem>
          </NavbarContent>
        )}
        {/* Mobile View */}
        {userRole !== Role.ANONYMOUS && (
          <NavbarMenu className="gap-y-4 bg-content2">
            {links.map(({ href, text, icon }) => (
              <NavbarMenuItem key={href}>
                <button
                  key={href}
                  onClick={() => navigateRoute(href)}
                  className="flex items-center gap-4"
                >
                  <Icon icon={icon} height={20} width={20} />
                  <p>{text}</p>
                </button>
              </NavbarMenuItem>
            ))}
            <NavbarMenuItem>
              <AccountModal />
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                color="danger"
                data-cy="auth-mobile-navbar-logout-button"
                onPress={() => signOut({ callbackUrl: "/" })}
                className="font-bol flex w-full cursor-pointer items-center gap-x-4 rounded-sm text-left"
              >
                <Icon
                  icon={"basil:logout-solid"}
                  color="text-destructive"
                  height={24}
                  width={24}
                />
                <p>Log Out</p>
              </Button>
            </NavbarMenuItem>
          </NavbarMenu>
        )}
      </div>
    </Navbar>
  );
}
