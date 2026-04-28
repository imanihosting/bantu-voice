import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/features/marketing/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="13 March 2025">
      <p>
        TaurAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed
        to protecting your privacy. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you use our AI voice
        platform, including our website, applications, and API services
        (collectively, the &quot;Service&quot;).
      </p>
      <p>
        By accessing or using the Service, you agree to the collection and use
        of information in accordance with this Privacy Policy. If you do not
        agree with the terms of this Privacy Policy, please do not access or use
        the Service.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Account Information</h3>
      <p>
        When you create an account, we collect your name, email address, and
        password (stored in hashed form). This information is necessary to
        provide you with access to the Service and to manage your account.
      </p>

      <h3>1.2 Voice and Audio Data</h3>
      <p>
        When you use our text-to-speech, speech-to-text, or voice cloning
        features, we process audio data that you submit. This may include:
      </p>
      <ul>
        <li>Audio recordings uploaded for transcription or voice cloning</li>
        <li>Text input submitted for speech synthesis</li>
        <li>Generated audio output files</li>
        <li>Voice profiles created through voice cloning</li>
      </ul>

      <h3>1.3 Usage Data</h3>
      <p>
        We automatically collect certain information when you access the
        Service, including:
      </p>
      <ul>
        <li>IP address and approximate geographic location</li>
        <li>Browser type and version</li>
        <li>Pages visited and features used</li>
        <li>Date and time of access</li>
        <li>API request logs (endpoints accessed, response times)</li>
      </ul>

      <h3>1.4 Cookies and Tracking Technologies</h3>
      <p>
        We use cookies and similar tracking technologies to maintain your
        session, remember your preferences, and improve the Service. For more
        information, please see our{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>
          <strong>Service Delivery:</strong> To provide, operate, and maintain
          the Service, including processing your voice and audio data
        </li>
        <li>
          <strong>Account Management:</strong> To create and manage your
          account, authenticate your identity, and provide customer support
        </li>
        <li>
          <strong>Service Improvement:</strong> To understand how the Service is
          used and to develop new features and improvements
        </li>
        <li>
          <strong>Security:</strong> To detect, prevent, and address technical
          issues, fraud, and security threats
        </li>
        <li>
          <strong>Communication:</strong> To send you service-related notices,
          updates, and administrative messages
        </li>
        <li>
          <strong>Legal Compliance:</strong> To comply with applicable laws,
          regulations, and legal processes
        </li>
      </ul>

      <h2>3. Data Storage and Security</h2>
      <p>
        We implement industry-standard technical and organisational measures to
        protect your personal information against unauthorised access,
        alteration, disclosure, or destruction. These measures include:
      </p>
      <ul>
        <li>Encryption of data in transit using TLS/SSL protocols</li>
        <li>Encryption of sensitive data at rest</li>
        <li>Regular security assessments and vulnerability testing</li>
        <li>Access controls limiting data access to authorised personnel</li>
        <li>Secure password hashing using industry-standard algorithms</li>
      </ul>
      <p>
        While we strive to protect your personal information, no method of
        electronic transmission or storage is completely secure. We cannot
        guarantee absolute security of your data.
      </p>

      <h2>4. Data Sharing and Disclosure</h2>
      <p>
        We do not sell, trade, or rent your personal information to third
        parties. We may share your information only in the following
        circumstances:
      </p>
      <ul>
        <li>
          <strong>Service Providers:</strong> With trusted third-party service
          providers who assist us in operating the Service, subject to
          confidentiality obligations
        </li>
        <li>
          <strong>Legal Requirements:</strong> When required by law, regulation,
          legal process, or governmental request
        </li>
        <li>
          <strong>Protection of Rights:</strong> To protect the rights, property,
          or safety of TaurAI, our users, or the public
        </li>
        <li>
          <strong>Business Transfers:</strong> In connection with a merger,
          acquisition, or sale of all or a portion of our assets
        </li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>
        We retain your personal information for as long as your account is
        active or as needed to provide the Service. Specific retention periods
        include:
      </p>
      <ul>
        <li>
          <strong>Account Data:</strong> Retained until you delete your account
        </li>
        <li>
          <strong>Generated Audio:</strong> Retained in accordance with your
          account storage limits and settings
        </li>
        <li>
          <strong>API Logs:</strong> Retained for up to 90 days for security and
          debugging purposes
        </li>
        <li>
          <strong>Usage Data:</strong> Retained in aggregated, anonymised form
          for analytical purposes
        </li>
      </ul>
      <p>
        Upon account deletion, we will delete or anonymise your personal
        information within 30 days, except where retention is required by law.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have the following rights
        regarding your personal information:
      </p>
      <ul>
        <li>
          <strong>Access:</strong> The right to request a copy of the personal
          information we hold about you
        </li>
        <li>
          <strong>Rectification:</strong> The right to request correction of
          inaccurate or incomplete personal information
        </li>
        <li>
          <strong>Deletion:</strong> The right to request deletion of your
          personal information, subject to certain exceptions
        </li>
        <li>
          <strong>Data Portability:</strong> The right to request a copy of your
          data in a structured, machine-readable format
        </li>
        <li>
          <strong>Objection:</strong> The right to object to certain processing
          of your personal information
        </li>
        <li>
          <strong>Restriction:</strong> The right to request restriction of
          processing of your personal information
        </li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at{" "}
        <a href="mailto:support@taurai.ai">support@taurai.ai</a>.
      </p>

      <h2>7. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other
        than the country in which you reside. These countries may have data
        protection laws that are different from the laws of your country. We
        take appropriate safeguards to ensure that your personal information
        remains protected in accordance with this Privacy Policy.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        The Service is not intended for use by individuals under the age of 16.
        We do not knowingly collect personal information from children under 16.
        If we become aware that we have collected personal information from a
        child under 16, we will take steps to delete such information promptly.
      </p>

      <h2>9. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes
        in our practices or applicable laws. We will notify you of any material
        changes by posting the updated Privacy Policy on this page and updating
        the &quot;Last updated&quot; date. Your continued use of the Service
        after any changes constitutes your acceptance of the updated Privacy
        Policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have any questions, concerns, or requests regarding this Privacy
        Policy or our data practices, please contact us at:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:support@taurai.ai">support@taurai.ai</a>
      </p>
    </LegalPageLayout>
  );
}
