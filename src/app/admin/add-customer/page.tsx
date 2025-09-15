"use client";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import generator from "generate-password";
import { createClient } from "@/lib/supabase/client";
import { inviteUser } from "@/lib/supabase/server";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function AddCustomerPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [orgNr, setOrgNr] = useState("");
  const [loading, setLoading] = useState(false);

  function generatePassword() {
    return generator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
      excludeSimilarCharacters: true,
      strict: true,
    });
  }

  async function handleAddCustomer() {
    if (!email || !companyName || !orgNr) {
      toast.error("Fyll i alla fält.");
      return;
    }
    setLoading(true);

    try {
      // 1) Create invited user
      const password = generatePassword();
      const data = await inviteUser(email, password);

      // 2) Insert company into DB (if you have a companies table)
      const { data: company, error: insertError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          organisation_number: orgNr,
          user_id: data.user?.id,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          { user_id: data.user?.id, email, company_id: company?.id ?? null },
          { onConflict: "user_id" }
        );
      if (profileError) throw profileError;
      toast.success("Kund inbjuden och skapad!");
      setCompanyName("");
      setEmail("");
      setOrgNr("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);

        if (
          err.message.includes(
            "Unable to validate email address: invalid format"
          )
        ) {
          toast.error("Felaktig e-post");
        }
      } else {
        console.error("Okänt fel: ", err);
        toast.error("Kunde inte lägga till kund.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mr-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lägg till kund</CardTitle>
          <CardDescription>
            Fyll i informationen nedan för att skapa en ny kund.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[0.8rem]">
              Företagsnamn
            </Label>
            <Input
              id="name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Devotion Ventures AB"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[0.8rem]">
              Kontakt-e-post
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kund@example.com"
            />
          </div>
          <div className="space-y-2 mb-5">
            <Label htmlFor="orgNr" className="text-[0.8rem]">
              Organisationsnummer
            </Label>
            <InputOTP
              maxLength={10}
              pattern={REGEXP_ONLY_DIGITS}
              value={orgNr}
              onChange={setOrgNr}
            >
              <InputOTPGroup className=" ">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="h-7 w-7" />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className=" ">
                {Array.from({ length: 4 }).map((_, i) => (
                  <InputOTPSlot key={i + 6} index={i + 6} className="h-7 w-7" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleAddCustomer}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                {" "}
                <Loader2 className="animate-spin" />
                Lägger till kund
              </>
            ) : (
              "Lägg till"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
