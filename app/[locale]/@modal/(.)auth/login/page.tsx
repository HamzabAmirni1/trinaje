import { CredentialsLoginForm } from "@/features/auth/signin/ui/CredentialsLoginForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function LoginModal() {
  return (
    <Dialog defaultOpen>
      <DialogContent className="sm:max-w-md bg-[#12112d] border border-white/10 text-white rounded-2xl shadow-2xl p-8">
        <CredentialsLoginForm />
      </DialogContent>
    </Dialog>
  );
}
