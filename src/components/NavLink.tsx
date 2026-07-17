import type { Ref } from "react";
import { type NavLinkProps, NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  activeClassName?: string;
  className?: string;
  pendingClassName?: string;
  ref?: Ref<HTMLAnchorElement>;
}

function NavLink({
  className,
  activeClassName,
  pendingClassName,
  ref,
  to,
  ...props
}: NavLinkCompatProps) {
  return (
    <RouterNavLink
      className={({ isActive, isPending }) =>
        cn(
          className,
          isActive && activeClassName,
          isPending && pendingClassName
        )
      }
      ref={ref}
      to={to}
      {...props}
    />
  );
}

export { NavLink };
