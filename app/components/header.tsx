import { Form, Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";

export default function Header() {
  const user = useOptionalUser();

  return (
    <nav className="absolute left-0 top-0 flex h-16 w-full items-center justify-center bg-slate-800">
      {user ? (
        <div className="flex w-11/12 justify-between">
          <div>Hi {user.email}</div>
          <Form action="/logout" method="post">
            <button>Logout</button>
          </Form>
        </div>
      ) : (
        <Link to="/login" id="login-button">
          Login
        </Link>
      )}
    </nav>
  );
}
