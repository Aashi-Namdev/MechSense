import { Link, useParams } from "react-router-dom";
import { MOCK_MACHINES } from "../data/machines.js";

function MachinesDetail() {
  const { id } = useParams();
  const machine = MOCK_MACHINES.find((m) => m.id === Number(id));

  if (!machine) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to="/machines"
          className="text-sm font-medium text-primary hover:underline"
        >
          &larr; <span className="hover:underline">Back to machines</span>
        </Link>
        <p className="mt-6 text-sm text-text-muted">
          Machine record not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link to="/machines" className="text-sm font-medium text-primary ">
        &larr; <span className="hover:underline">Back to machines</span>
      </Link>
      <header>
        <h1 className="text-xl font-semibold text-text-main mt-3">
          {machine.productId}
        </h1>
      </header>
    </div>
  );
}

export default MachinesDetail;
