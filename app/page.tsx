import Image from "next/image"
import Link from "next/link"

export default function Hero() {
  return (
    <div className="h-dvh overflow-y-auto no-scrollbar">
      <div className="h-15 w-full px-2 flex items-center justify-between fixed">
        <div className="flex items-center gap-2">
          <Image
            src="/favicon.ico"
            alt="logo"
            width={15}
            height={15}
            className="h-12 w-12"
          />
          <h1 className="font-bold text-2xl">
            CashCanopy
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/authentication/login"
            className="border-border border-2 p-2 rounded-md"
          >
            Login
          </Link>

          <Link
            href="/authentication/signup"
            className="bg-primary p-2 rounded-md"
          >
            Get Started
          </Link>
        </div>
      </div>
      <div className="pt-15">
        This is where the rest of the hero page items will go.
      </div>
    </div>
  );
}
