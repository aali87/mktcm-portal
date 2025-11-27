import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Terms of Service | ClearPath Fertility",
  description: "Terms of Service for ClearPath Fertility member portal and programs.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-neutral-800 mb-8">Terms of Service</h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-600 mb-6">
            <strong>Last Updated:</strong> November 2024
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">1. Agreement to Terms</h2>
            <p className="text-neutral-600 mb-4">
              By accessing or using the ClearPath Fertility website and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">2. Description of Services</h2>
            <p className="text-neutral-600 mb-4">
              ClearPath Fertility provides educational content, programs, and resources related to fertility wellness and Traditional Chinese Medicine. Our Services include:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Online educational programs and courses</li>
              <li>Digital workbooks and resources</li>
              <li>Video content and tutorials</li>
              <li>Member portal access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">3. Account Registration</h2>
            <p className="text-neutral-600 mb-4">
              To access certain features of our Services, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">4. Purchases and Payments</h2>

            <h3 className="font-semibold text-neutral-800 mb-2">Pricing</h3>
            <p className="text-neutral-600 mb-4">
              All prices are displayed in US dollars unless otherwise stated. We reserve the right to change prices at any time without prior notice.
            </p>

            <h3 className="font-semibold text-neutral-800 mb-2">Payment Plans</h3>
            <p className="text-neutral-600 mb-4">
              Some programs offer payment plan options. By enrolling in a payment plan, you authorize us to charge your payment method according to the agreed schedule until all payments are complete.
            </p>

            <h3 className="font-semibold text-neutral-800 mb-2">Refund Policy</h3>
            <p className="text-neutral-600 mb-4">
              Due to the digital nature of our products, all sales are final. We do not offer refunds once you have accessed the program content. If you experience technical issues, please contact us for assistance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">5. Intellectual Property</h2>
            <p className="text-neutral-600 mb-4">
              All content provided through our Services, including but not limited to text, graphics, logos, videos, audio, and software, is the property of ClearPath Fertility or its content suppliers and is protected by intellectual property laws.
            </p>
            <p className="text-neutral-600 mb-4">
              You are granted a limited, non-exclusive, non-transferable license to access and use the content for personal, non-commercial purposes only. You may not:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Copy, reproduce, or distribute our content</li>
              <li>Modify or create derivative works</li>
              <li>Share your account access with others</li>
              <li>Use our content for commercial purposes</li>
              <li>Remove any copyright or proprietary notices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">6. Health Disclaimer</h2>
            <p className="text-neutral-600 mb-4">
              <strong>Important:</strong> The information provided through our Services is for educational purposes only and is not intended to replace professional medical advice, diagnosis, or treatment.
            </p>
            <p className="text-neutral-600 mb-4">
              Always consult with a qualified healthcare provider before making any changes to your health regimen, especially regarding fertility treatments. Our content is not intended to diagnose, treat, cure, or prevent any disease or health condition.
            </p>
            <p className="text-neutral-600 mb-4">
              By using our Services, you acknowledge that you understand these limitations and agree that ClearPath Fertility is not responsible for any health decisions you make based on our educational content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">7. User Conduct</h2>
            <p className="text-neutral-600 mb-4">
              You agree not to use our Services to:
            </p>
            <ul className="list-disc list-inside text-neutral-600 mb-4 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of our Services</li>
              <li>Engage in any activity that could damage our reputation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">8. Limitation of Liability</h2>
            <p className="text-neutral-600 mb-4">
              To the fullest extent permitted by law, ClearPath Fertility shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our Services.
            </p>
            <p className="text-neutral-600 mb-4">
              Our total liability for any claims arising from your use of our Services shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">9. Indemnification</h2>
            <p className="text-neutral-600 mb-4">
              You agree to indemnify, defend, and hold harmless ClearPath Fertility and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our Services or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">10. Termination</h2>
            <p className="text-neutral-600 mb-4">
              We reserve the right to suspend or terminate your access to our Services at any time, with or without cause, and with or without notice. Upon termination, your right to use our Services will immediately cease.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">11. Changes to Terms</h2>
            <p className="text-neutral-600 mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of our Services after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">12. Governing Law</h2>
            <p className="text-neutral-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ClearPath Fertility operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-2xl text-neutral-800 mb-4">13. Contact Information</h2>
            <p className="text-neutral-600 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-neutral-600">
              <strong>Email:</strong> support@clearpathfertility.com
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
