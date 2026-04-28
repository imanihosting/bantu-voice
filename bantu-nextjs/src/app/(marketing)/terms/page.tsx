import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/features/marketing/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="13 March 2025">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the TaurAI platform, including our website, applications, and API
        services (collectively, the &quot;Service&quot;). By accessing or using
        the Service, you agree to be bound by these Terms.
      </p>
      <p>
        Please read these Terms carefully before using the Service. If you do
        not agree with any part of these Terms, you may not access or use the
        Service.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or otherwise accessing or using the Service, you
        represent and warrant that you are at least 16 years of age and have the
        legal capacity to enter into these Terms. If you are using the Service
        on behalf of an organisation, you represent and warrant that you have
        the authority to bind that organisation to these Terms.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        TaurAI provides an artificial intelligence voice platform that offers
        the following capabilities:
      </p>
      <ul>
        <li>
          <strong>Text-to-Speech:</strong> Conversion of text input into
          natural-sounding audio in multiple African languages
        </li>
        <li>
          <strong>Speech-to-Text:</strong> Transcription of audio recordings
          into text
        </li>
        <li>
          <strong>Voice Cloning:</strong> Creation of custom voice profiles from
          audio samples
        </li>
        <li>
          <strong>REST API:</strong> Programmatic access to the above
          capabilities for integration into third-party applications
        </li>
      </ul>
      <p>
        We reserve the right to modify, suspend, or discontinue any part of the
        Service at any time, with or without notice.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        To access certain features of the Service, you must create an account.
        You agree to:
      </p>
      <ul>
        <li>Provide accurate, current, and complete information during registration</li>
        <li>Maintain and promptly update your account information</li>
        <li>Maintain the security and confidentiality of your login credentials</li>
        <li>Accept responsibility for all activities that occur under your account</li>
        <li>Notify us immediately of any unauthorised use of your account</li>
      </ul>
      <p>
        We reserve the right to suspend or terminate accounts that contain
        inaccurate information or that violate these Terms.
      </p>

      <h2>4. Acceptable Use Policy</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>
          Generate content that is unlawful, harmful, threatening, abusive,
          harassing, defamatory, vulgar, obscene, or otherwise objectionable
        </li>
        <li>
          Impersonate any person or entity, or falsely state or misrepresent
          your affiliation with a person or entity
        </li>
        <li>
          Create deepfake audio or synthetic voice content intended to deceive,
          defraud, or mislead others
        </li>
        <li>
          Clone voices of individuals without their explicit, informed consent
        </li>
        <li>
          Violate any applicable local, national, or international law or
          regulation
        </li>
        <li>
          Interfere with or disrupt the Service, servers, or networks connected
          to the Service
        </li>
        <li>
          Attempt to gain unauthorised access to any portion of the Service or
          any other systems or networks
        </li>
        <li>
          Use the Service for any form of spam, unsolicited communications, or
          mass-generated content
        </li>
        <li>
          Reverse engineer, decompile, or disassemble any aspect of the Service
        </li>
        <li>
          Use automated means to access the Service in a manner that exceeds
          reasonable request volumes or constitutes excessive use
        </li>
      </ul>

      <h2>5. Voice Cloning — Consent and Restrictions</h2>
      <p>
        Voice cloning is a powerful capability that carries significant ethical
        responsibilities. By using the voice cloning feature, you represent and
        warrant that:
      </p>
      <ul>
        <li>
          You have obtained explicit, informed consent from any individual whose
          voice you clone using the Service
        </li>
        <li>
          You will not use cloned voices for fraudulent, deceptive, or malicious
          purposes
        </li>
        <li>
          You will clearly disclose to any audience that synthesised voice
          content was generated using AI technology
        </li>
        <li>
          You will comply with all applicable laws and regulations regarding
          synthetic media and voice reproduction
        </li>
      </ul>
      <p>
        TaurAI reserves the right to suspend or terminate access to voice
        cloning features if we reasonably believe they are being misused.
      </p>

      <h2>6. Intellectual Property</h2>

      <h3>6.1 TaurAI Property</h3>
      <p>
        The Service, including its original content, features, functionality,
        underlying technology, and all associated intellectual property rights,
        are and shall remain the exclusive property of TaurAI. The Service is
        protected by copyright, trademark, and other intellectual property laws.
      </p>

      <h3>6.2 Your Content</h3>
      <p>
        You retain all rights to the content you submit to the Service,
        including text, audio recordings, and other materials (&quot;User
        Content&quot;). By submitting User Content, you grant TaurAI a
        non-exclusive, worldwide, royalty-free licence to use, process, and
        store such content solely for the purpose of providing the Service to
        you.
      </p>

      <h3>6.3 Generated Content</h3>
      <p>
        Subject to these Terms and any applicable laws, you own the audio
        content generated through your use of the Service. You are solely
        responsible for ensuring that your use of generated content complies
        with all applicable laws and does not infringe upon the rights of any
        third party.
      </p>

      <h2>7. API Usage</h2>
      <p>
        If you access the Service through our API, the following additional
        terms apply:
      </p>
      <ul>
        <li>
          You must use valid API credentials and keep them confidential
        </li>
        <li>
          You must comply with any rate limits, usage quotas, and technical
          requirements communicated by TaurAI
        </li>
        <li>
          You must not share, transfer, or sell your API credentials to third
          parties
        </li>
        <li>
          You are responsible for all API usage that occurs under your
          credentials
        </li>
        <li>
          TaurAI reserves the right to throttle, suspend, or revoke API access
          at its discretion
        </li>
      </ul>

      <h2>8. Fees and Payment</h2>
      <p>
        Certain features of the Service may be subject to fees. We will clearly
        communicate any applicable fees before you incur them. All fees are
        stated in the currency indicated at the time of purchase and are
        non-refundable unless otherwise specified or required by applicable law.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
        TAURAI, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR
        AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS
        OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING
        FROM:
      </p>
      <ul>
        <li>Your access to or use of, or inability to access or use, the Service</li>
        <li>Any conduct or content of any third party on the Service</li>
        <li>Any content obtained from the Service</li>
        <li>
          Unauthorised access, use, or alteration of your transmissions or
          content
        </li>
      </ul>

      <h2>10. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
        AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT. TAURAI DOES NOT WARRANT THAT THE SERVICE WILL BE
        UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE
        CORRECTED.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless TaurAI and its
        officers, directors, employees, agents, and affiliates from and against
        any claims, liabilities, damages, losses, costs, and expenses
        (including reasonable legal fees) arising out of or in any way connected
        with your access to or use of the Service, your violation of these
        Terms, or your infringement of any intellectual property or other right
        of any person or entity.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may terminate or suspend your account and access to the Service
        immediately, without prior notice or liability, for any reason,
        including if you breach these Terms. Upon termination, your right to use
        the Service will cease immediately. Provisions of these Terms that by
        their nature should survive termination shall survive, including
        ownership provisions, warranty disclaimers, indemnity, and limitations
        of liability.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the jurisdiction in which TaurAI operates, without regard to
        its conflict of law provisions. Any disputes arising from these Terms
        or the Service shall be resolved through good-faith negotiation, and
        if necessary, through binding arbitration or the courts of competent
        jurisdiction.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We reserve the right to modify these Terms at any time. We will provide
        notice of material changes by posting the updated Terms on this page
        and updating the &quot;Last updated&quot; date. Your continued use of
        the Service after any changes constitutes your acceptance of the revised
        Terms. We encourage you to review these Terms periodically.
      </p>

      <h2>15. Severability</h2>
      <p>
        If any provision of these Terms is held to be invalid, illegal, or
        unenforceable, the remaining provisions shall continue in full force
        and effect. The invalid or unenforceable provision shall be modified to
        the minimum extent necessary to make it valid and enforceable.
      </p>

      <h2>16. Entire Agreement</h2>
      <p>
        These Terms, together with our{" "}
        <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/cookies">Cookie Policy</Link>, constitute the entire
        agreement between you and TaurAI regarding the use of the Service and
        supersede all prior agreements and understandings.
      </p>

      <h2>17. Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please contact
        us at:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:support@taurai.ai">support@taurai.ai</a>
      </p>
    </LegalPageLayout>
  );
}
