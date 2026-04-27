import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MarketingLayout from "../components/MarketingLayout.jsx";

const POLICY_EMAIL = "policies@nomorae.com";
const EFFECTIVE_DATE = "27 April 2026";

function SectionHeading({ children, id }) {
  return (
    <h2 id={id} className="mt-10 text-2xl font-bold text-[#0F172A]">
      {children}
    </h2>
  );
}

function SubHeading({ children }) {
  return <h3 className="mt-6 text-lg font-semibold text-[#0F172A]">{children}</h3>;
}

function Paragraph({ children }) {
  return <p className="mt-3 text-sm leading-6 text-slate-700">{children}</p>;
}

function Bullets({ items }) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700 list-disc list-inside">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Nomorae | Privacy Policy";
  }, []);

  return (
    <MarketingLayout enableDemoButton>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="rounded-3xl border border-brand-200/90 bg-gradient-to-b from-white to-brand-50 p-6 sm:p-10">
          <span className="rounded-full border border-brand-200/90 bg-brand-50 px-4 py-2 text-xs font-semibold text-[#14532d]">
            POPIA-aligned · Effective {EFFECTIVE_DATE}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#0F172A]">Privacy Policy</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            This Privacy Policy explains how Nomorae (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects,
            uses, shares, and protects personal information in line with the Protection of Personal Information
            Act, 4 of 2013 (&quot;POPIA&quot;) of the Republic of South Africa.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
          <SectionHeading id="who-we-are">1. Who we are</SectionHeading>
          <Paragraph>
            Nomorae provides AI-assisted legal productivity software, including document review, drafting,
            research, and workflow automation tools (the &quot;Service&quot;). For the purposes of POPIA, Nomorae acts
            as a &quot;Responsible Party&quot; for the personal information you provide directly to us when you create
            an account, contact us, or use marketing features. Nomorae acts as an &quot;Operator&quot; in respect of
            personal information contained in the documents and content that you (or your workspace
            administrators) upload or generate while using the Service.
          </Paragraph>
          <Paragraph>
            <strong>Information Officer:</strong> Enquiries, requests, and complaints in connection with this
            Privacy Policy or POPIA may be directed to our designated contact at{" "}
            <a className="text-[#16A34A] hover:underline" href={`mailto:${POLICY_EMAIL}`}>
              {POLICY_EMAIL}
            </a>
            .
          </Paragraph>

          <SectionHeading id="information-we-collect">2. Information we collect</SectionHeading>
          <SubHeading>2.1 Information you provide</SubHeading>
          <Bullets
            items={[
              "Account details such as name, email address, password (hashed), firm name, role, and contact details.",
              "Workspace and billing information, including subscription tier, seat count, payment intent records, and PayFast tokens (we do not store full card numbers; payment processing is handled by PayFast).",
              "Documents, matter files, prompts, notes, and other content you choose to upload or generate within the Service.",
              "Communications with us (e.g. support requests, demo bookings, feedback).",
            ]}
          />

          <SubHeading>2.2 Information we collect automatically</SubHeading>
          <Bullets
            items={[
              "Usage metadata: pages visited, features used, AI requests, search queries, and audit-log events.",
              "Technical data: IP address, browser type, device identifiers, operating system, and timestamps.",
              "Cookies and similar technologies, used to keep you signed in, remember preferences, and measure aggregate usage.",
            ]}
          />

          <SubHeading>2.3 Information from third parties</SubHeading>
          <Bullets
            items={[
              "Payment status and tokens from PayFast in respect of subscriptions and renewals.",
              "Email delivery metadata from our outbound email provider (e.g. Resend / SMTP) for transactional and marketing emails.",
              "Authentication metadata from any single sign-on or OAuth provider you connect.",
            ]}
          />

          <SectionHeading id="lawful-basis">3. Lawful basis and how we use information</SectionHeading>
          <Paragraph>
            We process personal information only where we have a lawful basis under POPIA, including:
          </Paragraph>
          <Bullets
            items={[
              "Performance of a contract — to create your account, deliver the Service, manage subscriptions, and provide support.",
              "Legitimate interests — to secure the Service, prevent abuse, improve features, conduct analytics, and operate our business, where this does not override your rights.",
              "Consent — where required, for example for direct marketing or optional cookies; you may withdraw consent at any time.",
              "Legal obligation — to comply with tax, accounting, anti-fraud, and other applicable laws.",
            ]}
          />

          <SectionHeading id="ai-processing">4. AI features and your content</SectionHeading>
          <Paragraph>
            Nomorae uses third-party large language models and other AI services to power features such as
            review, drafting, research, semantic search, and the assistant. When you use these features, the
            relevant content (e.g. excerpts, prompts, retrieved passages) is transmitted to those providers
            solely to generate the response shown to you. We do not authorise providers to use your content
            to train their general-purpose foundation models, where the provider supports such an option.
          </Paragraph>
          <Paragraph>
            You and your workspace administrators are responsible for ensuring you have the necessary rights
            and lawful basis to upload personal information of third parties (such as clients, opposing
            parties, or witnesses) into the Service.
          </Paragraph>

          <SectionHeading id="sharing">5. Who we share information with</SectionHeading>
          <Paragraph>
            We do not sell personal information. We share it only with trusted operators that help us run the
            Service, including:
          </Paragraph>
          <Bullets
            items={[
              "Cloud infrastructure and database providers that host the Service.",
              "Payment processor (PayFast) for subscription and transaction handling.",
              "Email and communications providers for transactional and marketing emails.",
              "AI model providers used to generate AI responses on your behalf.",
              "Professional advisors (legal, accounting, audit) when required.",
              "Authorities or regulators where compelled by law or to protect rights, property, or safety.",
            ]}
          />
          <Paragraph>
            Each operator is bound by written agreements, including confidentiality and security obligations
            consistent with POPIA, and is permitted to process personal information only on our documented
            instructions.
          </Paragraph>

          <SectionHeading id="cross-border">6. Cross-border transfers</SectionHeading>
          <Paragraph>
            Some of our operators (for example certain cloud, email, and AI providers) may process personal
            information outside of South Africa. Where this occurs, we rely on the conditions in section 72 of
            POPIA, including binding agreements that provide an adequate level of protection comparable to
            POPIA, your consent where applicable, or because the transfer is necessary for the performance of
            a contract with you.
          </Paragraph>

          <SectionHeading id="retention">7. Retention</SectionHeading>
          <Paragraph>
            We retain personal information only for as long as is necessary to provide the Service, comply
            with our legal obligations (such as tax and accounting), resolve disputes, and enforce our
            agreements. Documents and workspace content are retained according to your workspace
            configuration; deleted items may persist in encrypted backups for a limited period before being
            permanently purged. Audit log records may be retained for security and compliance purposes for a
            longer period.
          </Paragraph>

          <SectionHeading id="security">8. Security safeguards</SectionHeading>
          <Paragraph>
            We implement reasonable technical and organisational measures to protect personal information
            against loss, damage, unlawful access, or destruction. These include encrypted transport (TLS),
            permission enforcement at the workspace level, security headers, password hashing, role-based
            access control, audit logging of key operations, and secure secrets management. No system can be
            guaranteed completely secure; you also play a role by keeping your credentials confidential and
            using strong passwords.
          </Paragraph>

          <SectionHeading id="your-rights">9. Your rights under POPIA</SectionHeading>
          <Paragraph>You have the right to:</Paragraph>
          <Bullets
            items={[
              "Be notified that personal information about you is being collected, or has been accessed or acquired by an unauthorised person.",
              "Request access to and a description of the personal information we hold about you (subject to applicable fees and verification).",
              "Request correction or deletion of personal information that is inaccurate, irrelevant, excessive, out of date, incomplete, misleading, or obtained unlawfully.",
              "Object, on reasonable grounds, to the processing of your personal information.",
              "Object to direct marketing and unsubscribe at any time.",
              "Withdraw consent, where processing is based on consent, without affecting prior lawful processing.",
              "Lodge a complaint with the Information Regulator of South Africa (https://inforegulator.org.za).",
            ]}
          />
          <Paragraph>
            To exercise any of these rights, contact us at{" "}
            <a className="text-[#16A34A] hover:underline" href={`mailto:${POLICY_EMAIL}`}>
              {POLICY_EMAIL}
            </a>
            . We may need to verify your identity before responding.
          </Paragraph>

          <SectionHeading id="cookies">10. Cookies</SectionHeading>
          <Paragraph>
            We use a small number of cookies and similar technologies to authenticate sessions, remember
            preferences, and measure aggregate usage. You can control cookies through your browser settings;
            disabling certain cookies may impact your ability to sign in or use parts of the Service.
          </Paragraph>

          <SectionHeading id="children">11. Children</SectionHeading>
          <Paragraph>
            The Service is intended for use by legal professionals and is not directed at children under the
            age of 18. We do not knowingly collect personal information from children. If you believe a child
            has provided us with personal information, please contact us so we can take appropriate steps.
          </Paragraph>

          <SectionHeading id="breach">12. Security incidents</SectionHeading>
          <Paragraph>
            If we become aware of a security compromise that affects your personal information, we will
            notify the Information Regulator and affected data subjects as required by section 22 of POPIA,
            and take reasonable steps to investigate and remediate the incident.
          </Paragraph>

          <SectionHeading id="changes">13. Changes to this policy</SectionHeading>
          <Paragraph>
            We may update this Privacy Policy from time to time. Material changes will be communicated by
            posting the updated policy on this page and, where appropriate, by email or in-product notice. The
            &quot;Effective&quot; date at the top reflects the most recent revision.
          </Paragraph>

          <SectionHeading id="contact">14. Contact us</SectionHeading>
          <Paragraph>
            For any questions, requests, or complaints about this Privacy Policy or our processing of personal
            information, please email{" "}
            <a className="text-[#16A34A] hover:underline" href={`mailto:${POLICY_EMAIL}`}>
              {POLICY_EMAIL}
            </a>
            .
          </Paragraph>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/terms" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Read our Terms
            </Link>
            <Link to="/security" className="btn-secondary rounded-xl px-5 py-3 text-sm font-semibold">
              Security overview
            </Link>
            <Link to="/register" className="btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
              Get started
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
