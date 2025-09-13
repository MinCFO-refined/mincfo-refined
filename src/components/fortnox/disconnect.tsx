import { Link, Unlink } from "lucide-react";
import { Button } from "../ui/button";

export default function DisconnectFortnoxButton() {
  return (
    <Button className="flex gap-3 text-base" variant="destructive">
      <Unlink /> Koppla från
    </Button>
  );
}
