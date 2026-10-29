import { useState } from "react";
import { motion } from "motion/react";
import { MOCK_MACHINES } from "../data/machines.js";
import MachineSummary from "../components/machines/MachineSummary.jsx";
import MachineFilters from "../components/machines/MachineFilters.jsx";
import MachineTable from "../components/machines/MachineTable.jsx";

function Machines() {
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [sortDir, setSortDir] = useState("desc");
  // Filter the machines
  const query = searchText.trim().toLowerCase();

  const filteredMachines = MOCK_MACHINES.filter((machine) => {
    return riskFilter === "All" || machine.riskBand === riskFilter;
  })
    .filter((machine) => {
      return typeFilter === "All" || machine.type === typeFilter;
    })
    .filter((machine) => {
      return machine.productId.toLowerCase().includes(query);
    });

  // Sort the machines by probability (toggle ascending/descending)
  const visibleMachines = [...filteredMachines].sort((a, b) =>
    sortDir === "desc"
      ? b.probability - a.probability
      : a.probability - b.probability,
  );

  // when heaer is clicked change dir
  function handleToggleSortDir() {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-semibold text-text-main">Machines</h1>
        <p className="mt-1 text-sm text-text-muted">
          Review machine records, prediction risk, and failure status. Open a
          record to see its likely failure cause and recommended action.
        </p>
      </motion.header>

      {/* summary */}
      <MachineSummary machines={MOCK_MACHINES} />

      {/* Filters and search */}
      <MachineFilters
        riskFilter={riskFilter}
        setRiskFilter={setRiskFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        searchText={searchText}
        setSearchText={setSearchText}
        shown={visibleMachines.length}
        total={MOCK_MACHINES.length}
      />

      {/* Machines table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card"
      >
        <MachineTable
          machines={visibleMachines}
          sortDir={sortDir}
          onToggleSort={handleToggleSortDir}
        />
      </motion.div>
    </div>
  );
}

export default Machines;
