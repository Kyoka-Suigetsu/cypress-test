import Link from "next/link";
import IndexForm from "./index-form";
import Icon from "&/icon";

export default function Index() {
  return (
    <div className="w-full max-w-[600px] space-y-4 px-3">
      <IndexForm />
      <div className="flex w-full space-x-2 rounded-lg border border-content3 p-3 shadow-sm justify-center bg-content1">
        <p>Already Have An Account?</p>
        <Link
          href="/login"
          data-cy="login-link"
          className="flex items-center font-medium text-primary underline"
        >
          Login
          <Icon icon="ph:link-bold" />
        </Link>
      </div>
    </div>
  );
}
