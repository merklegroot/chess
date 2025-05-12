import { appConstants } from "@/constants/appConstants";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-6xl font-bold font-[family-name:var(--font-geist-sans)]">
        {appConstants.appTitle}
      </h1>
    </div>
  );
}
