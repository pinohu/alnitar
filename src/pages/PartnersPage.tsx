// src/pages/PartnersPage.tsx — B2B / For organizations (planetariums, schools, API)
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarField } from "@/components/StarField";
import { Building2, School, TreePine, Code, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const segments = [
  {
    icon: Building2,
    title: "Planetariums & venues",
    desc: "Powered by Alnitar live sessions: audience follows along on their phones while you drive the narrative. White-label or co-brand. Per seat or per event.",
  },
  {
    icon: School,
    title: "Schools & districts",
    desc: "Curriculum packs, lesson plans, and Alnitar for the classroom. Verified student logs, assignments, progress. Site or district license.",
  },
  {
    icon: TreePine,
    title: "Parks & dark-sky sites",
    desc: "Ranger-led nights with Alnitar as the guide. Visitor check-ins and 'I observed at [park]' credentials. Platform for conservancies and parks.",
  },
  {
    icon: Code,
    title: "API & partner apps",
    desc: "Identify sky in a photo, or get tonight's best targets for any location. Rate limits, SLA, and commercial terms. Integrate Alnitar into your app or site.",
  },
];

export default function PartnersPage() {
  return (
    <div className="relative min-h-screen">
      <StarField />
      <Navbar />
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">Clubs & organizations</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Use Alnitar for guided observing nights, education, and visitor programs. Verified logs, session tools, and options for clubs, schools, parks, and partners.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {segments.map((s) => (
              <div key={s.title} className="glass-card p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display font-semibold mb-2">{s.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 text-center">
            <h2 className="font-display text-xl font-bold mb-2">Get in touch</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Tell us about your organization — planetarium, school, park, or product. We'll respond with options for licensing, API access, or a custom partnership.
            </p>
            <Button asChild size="lg" className="btn-glow">
              <a href="mailto:support@alnitar.com?subject=Partnership%20or%20API%20inquiry">
                <Mail className="w-5 h-5 mr-2" />
                Contact us
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              API documentation and rate tiers coming soon. Early partners get priority access.
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            {" · "}
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            {" · "}
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
