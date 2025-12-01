import { MainLayout } from "@/components/layout/MainLayout";
import { FileText } from "lucide-react";

export default function Terms() {
    return (
        <MainLayout>
            <div className="container max-w-4xl py-12 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Terms of Service</h1>
                        <p className="text-muted-foreground">Last updated: November 30, 2024</p>
                    </div>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using KartTech, you accept and agree to be bound by the terms and provisions
                            of this agreement. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p>
                            KartTech is a reading platform that promotes serious reading and meaningful dialogue. Our mission
                            is to "trigger senses through art, restore common sense through dialogue." We provide:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access to a curated library of books</li>
                            <li>Reading tracking and progress monitoring</li>
                            <li>Gamification features (points, achievements, streaks)</li>
                            <li>Reading groups and discussion forums</li>
                            <li>Expert sessions and premium content</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                        <h3 className="text-xl font-medium mb-2">3.1 Registration</h3>
                        <p>
                            You must create an account to use most features of KartTech. You agree to provide accurate,
                            current, and complete information during registration.
                        </p>

                        <h3 className="text-xl font-medium mb-2 mt-4">3.2 Account Security</h3>
                        <p>
                            You are responsible for maintaining the confidentiality of your account credentials and for
                            all activities that occur under your account.
                        </p>

                        <h3 className="text-xl font-medium mb-2 mt-4">3.3 Account Termination</h3>
                        <p>
                            We reserve the right to suspend or terminate your account if you violate these terms or engage
                            in harmful behavior.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Post offensive, abusive, or inappropriate content</li>
                            <li>Harass, bully, or threaten other users</li>
                            <li>Impersonate others or misrepresent your identity</li>
                            <li>Attempt to hack, exploit, or disrupt the platform</li>
                            <li>Use automated tools to manipulate points or achievements</li>
                            <li>Share copyrighted content without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
                        <h3 className="text-xl font-medium mb-2">5.1 Platform Content</h3>
                        <p>
                            All content provided by KartTech, including book metadata, UI design, and platform features,
                            is protected by copyright and other intellectual property laws.
                        </p>

                        <h3 className="text-xl font-medium mb-2 mt-4">5.2 User-Generated Content</h3>
                        <p>
                            You retain ownership of content you create (discussions, comments, reviews). By posting content,
                            you grant KartTech a non-exclusive license to display and distribute it on the platform.
                        </p>

                        <h3 className="text-xl font-medium mb-2 mt-4">5.3 Book Content</h3>
                        <p>
                            Books available on KartTech are either in the public domain or provided through licensed APIs.
                            We respect copyright and will remove infringing content upon notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Points and Gamification</h2>
                        <p>
                            Points, achievements, and other gamification elements have no monetary value and cannot be
                            exchanged for cash or other goods. We reserve the right to adjust point values or reset
                            achievements if we detect abuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Premium Features</h2>
                        <p>
                            Some features, such as extended expert sessions, may require payment. All payments are processed
                            securely through third-party providers. Refund policies will be clearly stated at the time of purchase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Disclaimers</h2>
                        <p>
                            KartTech is provided "as is" without warranties of any kind. We do not guarantee uninterrupted
                            access or error-free operation. We are not responsible for the accuracy of book metadata or
                            third-party content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, KartTech shall not be liable for any indirect, incidental,
                            special, or consequential damages arising from your use of the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                        <p>
                            We may modify these terms at any time. Continued use of the platform after changes constitutes
                            acceptance of the new terms. We will notify users of significant changes via email or platform notification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                        <p>
                            These terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved
                            in the courts of [Your Jurisdiction].
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                        <p>
                            For questions about these Terms of Service, please contact us at legal@karttech.app (placeholder).
                        </p>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
