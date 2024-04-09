import WalletActions from "./components/WalletActions";

export default function Home() {
  return (
    <main className="w-full flex items-center justify-center bg-neutral-800 ">
      <div className="w-full flex flex-col items-center max-w-4xl mx-10 p-10 shadow-2xl rounded-xl bg-neutral-700">
        <h2 className="text-4xl text-white mb-5 w-full text-center">
          Derek Reid IPFS App
        </h2>
        <WalletActions />
      </div>
    </main>
  );
}
