import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { HelpCircle, Send, Loader2, MessageSquare, Bug, Lightbulb, AlertTriangle } from "lucide-react";

export default function Support() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ type: "question", subject: "", message: "" });

  const submitTicket = trpc.support.create.useMutation({
    onSuccess: () => { toast.success("Support ticket submitted! We'll get back to you."); setForm({ type: "question", subject: "", message: "" }); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.subject.trim() || !form.message.trim()) { toast.error("Please fill in all fields"); return; }
    submitTicket.mutate(form);
  };

  const typeIcons: Record<string, any> = { question: MessageSquare, bug: Bug, feature: Lightbulb, complaint: AlertTriangle };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-20 pb-16 flex-1">
        <div className="container max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <HelpCircle className="w-12 h-12 mx-auto text-purple-400" />
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-muted-foreground">Need help? We're here for you.</p>
          </div>

          <Card className="glass p-6 space-y-4">
            <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
              <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="feature">Feature Request</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Subject" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="glass" />
            <Textarea placeholder="Describe your issue or question..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="glass" rows={5} />
            {isAuthenticated && <p className="text-xs text-muted-foreground">Submitting as {user?.email || user?.name}</p>}
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0 gap-2" onClick={handleSubmit} disabled={submitTicket.isPending}>
              {submitTicket.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Submit Ticket</>}
            </Button>
          </Card>

          <Card className="glass p-6 space-y-3">
            <h2 className="font-semibold">FAQ</h2>
            <div className="space-y-4 text-sm">
              <div><p className="font-medium">What are tokens?</p><p className="text-muted-foreground">Tokens power AI features. New users get 10 free. Each AI action costs 1 token.</p></div>
              <div><p className="font-medium">How do I import a recipe?</p><p className="text-muted-foreground">Go to Import and paste a social media URL, upload a photo, or add manually.</p></div>
              <div><p className="font-medium">Is this affiliated with Starbucks?</p><p className="text-muted-foreground">No. Secret Sips is a community platform. All recipes are user-created.</p></div>
              <div><p className="font-medium">Can I delete my account?</p><p className="text-muted-foreground">Contact us via support and we'll handle it within 48 hours.</p></div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
