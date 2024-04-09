import AccountDetails from "./components/AccountDetails";

export default function Account() {
  return (
    <div className="w-full flex items-center justify-center bg-neutral-800">
      <div className="w-full flex flex-col items-center max-w-4xl mx-10 p-10 shadow-2xl rounded-xl bg-neutral-700">
        <h2 className="text-4xl mb-10 w-full text-center">Account Details</h2>
        <AccountDetails />
      </div>
    </div>
  );
}
