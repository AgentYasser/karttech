import { MainLayout } from "@/components/layout/MainLayout";
import { Shield } from "lucide-react";

export default function Privacy() {
    return (
        <MainLayout>
            <div className="container max-w-4xl py-12 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last updated: November 30, 2024</p>
                    </div>
                </div>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p>
                            Welcome to KartTech. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <h3 className="text-xl font-medium mb-2">2.1 Account Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Email address and username</li>
                            <li>Profile information (bio, avatar)</li>
                            <li>Reading preferences and history</li>
                        </ul>

                        <h3 className="text-xl font-medium mb-2 mt-4">2.2 Usage Data</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Reading sessions and progress</li>
                            <li>Points and achievements earned</li>
                            <li>Group memberships and discussions</li>
                            <li>Device and browser information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and maintain our reading platform</li>
                            <li>To personalize your reading experience</li>
                            <li>To track your progress and award achievements</li>
                            <li>To facilitate group discussions and community features</li>
                            <li>To send you notifications about platform updates</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                        <p>
                            Your data is stored securely using Supabase infrastructure with industry-standard encryption.
                            We implement appropriate technical and organizational measures to protect your personal information
                            against unauthorized access, alteration, or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Your Rights (GDPR)</h2>
                        <p>Under GDPR, you have the following rights:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Right to Rectification:</strong> Correct inaccurate personal data</li>
                            <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                            <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
                            <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                        </ul>
                        <p className="mt-4">
                            You can exercise these rights from your Profile settings page, where you'll find options to
                            export or delete your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                        <p>
                            We use essential cookies to maintain your session and remember your preferences.
                            We do not use third-party tracking cookies or sell your data to advertisers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
                        <p>We use the following third-party services:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Supabase:</strong> Database and authentication</li>
                            <li><strong>Google Books API:</strong> Book metadata and covers (free tier)</li>
                            <li><strong>Open Library API:</strong> Additional book information (free tier)</li>
                        </ul>
                        <p className="mt-4">
                            These services have their own privacy policies governing their use of your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
                        <p>
                            Our service is not intended for children under 13. We do not knowingly collect personal
                            information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. We will notify you of any changes by
                            posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us through the platform
                            or via email at privacy@karttech.app (placeholder).
                        </p>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
