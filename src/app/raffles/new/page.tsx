import { RaffleForm } from "../raffle-form";
import { createRaffleAction } from "../actions";

export default function NewRafflePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Nueva rifa</h1>
      <RaffleForm mode="create" action={createRaffleAction} />
    </div>
  );
}
