import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Header() {
  const user = useOptionalUser();

  return (
    <nav className="absolute left-0 top-0 flex h-16 w-full items-center justify-center bg-slate-800">
      {user ? (
        <div className="flex w-11/12 justify-between">
          <div>Hi {user.email}</div>
          <Link to="/logout">Logout</Link>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
