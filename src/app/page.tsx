import AuthButton from "./components/sign-in";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-4xl font-bold">Welcome to Scribe</h1>
        <AuthButton />
      </div>
    </main>
  );
}