import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiMail } from "react-icons/fi";

export default function VerifyRequestPage() {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-sm p-4 text-center">
        <CardHeader>
          <div className="bg-primary/10 text-primary mx-auto mb-4 w-fit rounded-full p-3">
            <FiMail size={24} />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            A secure sign-in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
