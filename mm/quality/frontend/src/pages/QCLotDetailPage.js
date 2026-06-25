import React from "react";
import { useParams } from "react-router-dom";
import QCLotDetail from "../components/qc/QCLotDetail";

export default function QCLotDetailPage() {
  const { id } = useParams();
  return <QCLotDetail lotId={Number(id)} />;
}
