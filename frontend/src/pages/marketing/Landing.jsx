// ============================================================
// pages/marketing/Landing.jsx
// The home page ("/"). Just stacks the landing sections in order:
// Hero -> Features -> How it works -> Pricing -> Waitlist
// ============================================================
import Hero from '../../components/landing/Hero';
import { Features, HowItWorks } from '../../components/landing/Features';
import PricingSection from '../../components/landing/PricingSection';
import WaitlistForm from '../../components/landing/WaitlistForm';

export default function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <PricingSection />
      <WaitlistForm />
    </>
  );
}