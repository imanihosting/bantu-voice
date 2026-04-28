import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageLayout } from "@/features/marketing/components/legal-page-layout";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="13 March 2025">
      <p>
        This Cookie Policy explains how TaurAI (&quot;we&quot;, &quot;our&quot;,
        or &quot;us&quot;) uses cookies and similar tracking technologies when
        you visit our website and use our Service. This policy should be read
        alongside our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files that are placed on your device (computer,
        tablet, or mobile phone) when you visit a website. They are widely used
        to make websites work more efficiently, provide a better user
        experience, and supply information to website operators. Cookies may be
        set by the website you are visiting (&quot;first-party cookies&quot;) or
        by third parties (&quot;third-party cookies&quot;).
      </p>

      <h2>2. Types of Cookies We Use</h2>

      <h3>2.1 Strictly Necessary Cookies</h3>
      <p>
        These cookies are essential for the operation of the Service. They
        enable core functionality such as authentication, session management,
        and security features. Without these cookies, the Service cannot
        function properly. These cookies do not require your consent.
      </p>
      <ul>
        <li>
          <strong>Session Cookie:</strong> Maintains your authenticated session
          while you are logged in. Expires when you close your browser or after
          your session times out.
        </li>
        <li>
          <strong>CSRF Token:</strong> Protects against cross-site request
          forgery attacks. Expires at the end of your session.
        </li>
        <li>
          <strong>Cookie Consent:</strong> Stores your cookie preferences so we
          do not ask you repeatedly. Expires after 12 months.
        </li>
      </ul>

      <h3>2.2 Functional Cookies</h3>
      <p>
        These cookies enable enhanced functionality and personalisation, such
        as remembering your language preferences, theme settings, and other
        customisations. They may be set by us or by third-party providers
        whose services we have integrated into the Service.
      </p>
      <ul>
        <li>
          <strong>Theme Preference:</strong> Remembers your light/dark mode
          preference. Expires after 12 months.
        </li>
        <li>
          <strong>Language Preference:</strong> Stores your preferred interface
          language. Expires after 12 months.
        </li>
      </ul>

      <h3>2.3 Analytics Cookies</h3>
      <p>
        These cookies help us understand how visitors interact with the Service
        by collecting and reporting information anonymously. The data gathered
        helps us improve the Service and understand usage patterns. These
        cookies are only set with your consent.
      </p>
      <ul>
        <li>
          <strong>Page Views:</strong> Tracks which pages are visited and how
          users navigate the Service. Data is aggregated and anonymised.
        </li>
        <li>
          <strong>Performance Metrics:</strong> Measures page load times and
          service responsiveness to help us identify and resolve performance
          issues.
        </li>
      </ul>

      <h2>3. How to Manage Cookies</h2>
      <p>
        You have the right to decide whether to accept or reject cookies
        (except strictly necessary cookies). You can manage your cookie
        preferences in the following ways:
      </p>

      <h3>3.1 Cookie Consent Banner</h3>
      <p>
        When you first visit our website, a cookie consent banner will appear
        allowing you to accept or decline non-essential cookies. You can change
        your preferences at any time by clearing your browser cookies and
        revisiting the site.
      </p>

      <h3>3.2 Browser Settings</h3>
      <p>
        Most web browsers allow you to control cookies through their settings.
        You can typically find these settings in the &quot;Options&quot;,
        &quot;Preferences&quot;, or &quot;Settings&quot; menu of your browser.
        Please note that disabling certain cookies may affect the functionality
        of the Service.
      </p>
      <ul>
        <li>
          <strong>Chrome:</strong> Settings → Privacy and security → Cookies and
          other site data
        </li>
        <li>
          <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies
          and Site Data
        </li>
        <li>
          <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
        </li>
        <li>
          <strong>Edge:</strong> Settings → Cookies and site permissions →
          Manage and delete cookies
        </li>
      </ul>

      <h3>3.3 Do Not Track</h3>
      <p>
        Some browsers offer a &quot;Do Not Track&quot; (DNT) signal. We
        currently honour DNT signals and will not set analytics cookies when
        a DNT signal is detected.
      </p>

      <h2>4. Third-Party Cookies</h2>
      <p>
        We may use third-party services that set their own cookies. These
        third parties have their own privacy and cookie policies, and we
        encourage you to review them. We do not control these third-party
        cookies and are not responsible for their use. Any third-party cookies
        are only activated with your consent.
      </p>

      <h2>5. Cookie Retention Periods</h2>
      <p>
        Cookies have varying lifespans depending on their purpose:
      </p>
      <ul>
        <li>
          <strong>Session Cookies:</strong> Deleted when you close your browser
        </li>
        <li>
          <strong>Persistent Cookies:</strong> Remain on your device for a set
          period (typically 1–12 months) or until manually deleted
        </li>
        <li>
          <strong>Cookie Consent:</strong> 12 months from the date of consent
        </li>
      </ul>

      <h2>6. Updates to This Cookie Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes
        in technology, legislation, or our data practices. We will notify you
        of any material changes by updating the &quot;Last updated&quot; date
        at the top of this page. We encourage you to periodically review this
        policy to stay informed about our use of cookies.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        If you have any questions about our use of cookies or this Cookie
        Policy, please contact us at:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:support@taurai.ai">support@taurai.ai</a>
      </p>
    </LegalPageLayout>
  );
}
