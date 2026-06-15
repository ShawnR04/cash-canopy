import Image from "next/image"
import Link from "next/link"
import { Button} from "@/components/ui/button"

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
      <div className="h-full px-1 overflow-y-auto no-scrollbar">
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <h1 className="md:w-2/3 lg:w-2/3 font-bold text-3xl md:text-4xl lg:text-5xl text-center">
            Everything you need to manage your personal expenses
          </h1>
          <p className="text-lg text-muted-foreground">
            Built for smarter tracking
          </p>
          <Button
            className="h-12 lg:h-14 w-35 font-bold text-xl hover:bg-primary/90 transition-all duration-300"
          >
            <Link href="/authentication/signup"
              className="h-full w-full flex items-center justify-center hover:bg-primary/90 transition-all duration-300"
            >
              Get Started
            </Link>
          </Button>
        </div>
      </div>
      <div className=""></div>
    </div>
  );
}
