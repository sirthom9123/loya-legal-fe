import React from "react";
import ClientLayout from "../components/ClientLayout.jsx";
import PlanPicker from "../components/PlanPicker.jsx";

export default function Plans() {
  return (
    <ClientLayout title="Choose a plan">
      <PlanPicker variant="page" />
    </ClientLayout>
  );
}
